import { every, filter, find, findIndex, forEach, get, identity, keys, LodashFilter, map, reduce } from "lodash/fp";
import Events from "../shared/event_catalog";
import DataHandler from "./data_handler";
import * as styles from "./styles";

import {
  ClickPayload,
  D3Selection,
  EventBus,
  HierarchyDatum,
  ProcessedData,
  State,
  StateWriter,
  WithConvert,
} from "./typings";

// d3 imports
import { interpolate as d3Interpolate, interpolateObject as d3InterpolateObject } from "d3-interpolate";
import { ScaleLinear, scaleLinear as d3ScaleLinear } from "d3-scale";
import * as d3 from "d3-selection";
import { Arc, arc as d3Arc } from "d3-shape";
import "d3-transition";
import { onTransitionEnd, withD3Element } from "../utils/d3_utils";

const arrowPath: string = "M-5 0 L0 -5 L5 0 M-4 -5 L0 -9 L4 -5 M-3 -10 L0 -13 L3 -10";
const spaceForArrow: number = 20;

class Renderer {
  private angleScale!: ScaleLinear<number, number>;
  private arc!: Arc<any, HierarchyDatum>;
  private currentTranslation!: [number, number];
  private data!: HierarchyDatum[];
  private dataHandler: DataHandler;
  private el: D3Selection;
  private events: EventBus;
  private mouseOverDatum?: HierarchyDatum;
  private previous!: HierarchyDatum[];
  private radiusScale: any;
  private radius!: number;
  private state: State;
  private stateWriter: StateWriter;
  private total!: number;
  private zoomNode!: HierarchyDatum;

  constructor(state: State, stateWriter: StateWriter, events: EventBus, el: D3Selection) {
    this.state = state;
    this.stateWriter = stateWriter;
    this.events = events;
    this.el = el;
    this.dataHandler = new DataHandler(state, stateWriter);
    this.events.on(Events.FOCUS.ELEMENT.CLICK, this.onClick.bind(this));
  }

  public draw() {
    this.compute();
    // Remove focus and truncation markers before updating chart
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
    this.removeTruncationArrows();

    const arcs = this.el
      .select("g.arcs")
      .attr("transform", this.translate())
      .selectAll(`path.${styles.arc}`)
      .data(this.data, get("id"));

    const config = this.state.current.getConfig();
    this.exit(arcs, config.duration, document.hidden || config.disableAnimations);
    this.enterAndUpdate(arcs, config.duration, document.hidden || config.disableAnimations);
  }

  private exit(arcs: D3Selection<HierarchyDatum>, duration: number, disableAnimations: boolean) {
    if (disableAnimations) {
      arcs.exit().remove();
      this.updateZoom();
    } else {
      arcs
        .exit()
        .transition()
        .duration(duration)
        .attrTween("d", d => this.removeArcTween(d as HierarchyDatum))
        .style("opacity", 1e-6)
        .remove()
        .call(onTransitionEnd, this.updateZoom.bind(this));
    }
  }

  private updateZoom() {
    const matchers = this.state.current.getConfig().zoomNode;
    if (!matchers) {
      this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d: undefined });
      return;
    }
    const zoomNode = find((d: HierarchyDatum) => {
      return every(identity)(
        reduce((memo: boolean[], matcher: keyof ProcessedData) => {
          memo.push(d.data[matcher] === matchers[matcher]);
          return memo;
        }, [])(keys(matchers) as Array<keyof ProcessedData>),
      );
    })(this.data);
    this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d: zoomNode });
  }

  private isFirstLevelChild(d: HierarchyDatum) {
    return d.parent === (this.zoomNode || this.dataHandler.topNode);
  }

  private arcClass(d: HierarchyDatum) {
    const parentClass = !d.parent ? "parent" : "";
    const zoomClass = d.data.zoomable ? "zoomable" : "";
    const emptyClass = d.data.empty && this.isFirstLevelChild(d) ? "empty" : "";
    return `${styles.arc} ${parentClass} ${zoomClass} ${emptyClass}`;
  }

  private enterAndUpdate(arcs: D3Selection<HierarchyDatum>, duration: number, disableAnimations: boolean) {
    const updatingArcs = arcs
      .enter()
      .append("svg:path")
      .merge(arcs)
      .attr("class", this.arcClass.bind(this))
      .style("fill", d => d.data.color)
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)))
      .on("click", (d: HierarchyDatum) => this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d, force: true }));

    if (disableAnimations) {
      updatingArcs.attr("d", d => this.arc(d));
      this.updateTruncationArrows();
    } else {
      updatingArcs
        .transition()
        .duration(duration)
        .attrTween("d", this.arcTween.bind(this))
        .call(onTransitionEnd, this.updateTruncationArrows.bind(this));
    }
  }

  // Computations
  private compute() {
    const drawingDims = this.state.current.getComputed().canvas.drawingDims;
    const outerBorderMargin = this.state.current.getConfig().outerBorderMargin;
    this.radius = Math.min(drawingDims.width, drawingDims.height) / 2 - outerBorderMargin;

    this.angleScale = d3ScaleLinear()
      .clamp(true)
      .range([0, 2 * Math.PI]);

    this.radiusScale = d3ScaleLinear()
      .clamp(true)
      .range([0, this.radius]);

    this.arc = d3Arc<HierarchyDatum>()
      .startAngle(this.startAngle.bind(this))
      .endAngle(this.endAngle.bind(this))
      .innerRadius(this.innerRadius.bind(this))
      .outerRadius(this.outerRadius.bind(this));

    this.previous = this.data;
    this.data = this.dataHandler.prepareData();
  }

  private startAngle(d: HierarchyDatum) {
    const minAngle = Math.asin(1 / this.radiusScale(d.y0)) || 0;
    const strokeAdjustment = d.data.empty ? minAngle : 0;
    return this.angleScale(d.x0) + strokeAdjustment;
  }

  private endAngle(d: HierarchyDatum) {
    // Set a minimum segment angle so that the segment can always be seen,
    // UNLESS the segment is not a descendant of the top or zoomed node (i.e. should not be visible)
    const show = findIndex(this.isEqual(this.zoomNode || this.dataHandler.topNode))(d.ancestors()) > -1;
    const minAngle = show ? Math.asin(1 / this.radiusScale(d.y0)) || 0 : 0;
    const strokeAdjustment = d.data.empty ? -minAngle : 0;
    return Math.max(this.angleScale(d.x0) + minAngle, Math.min(2 * Math.PI, this.angleScale(d.x1))) + strokeAdjustment;
  }

  private innerRadius(d: HierarchyDatum) {
    const strokeAdjustment = d.data.empty ? 1 : 0;
    return this.radiusScale(d.y0) + strokeAdjustment;
  }

  private outerRadius(d: HierarchyDatum) {
    const strokeAdjustment = d.data.empty ? 1 : 0;
    return this.radiusScale(d.y1) - strokeAdjustment;
  }

  // Center elements within drawing container
  private translate() {
    const drawingDims = this.state.current.getComputed().canvas.drawingDims;
    this.currentTranslation = [drawingDims.width / 2, drawingDims.height / 2];
    return `translate(${this.currentTranslation.join(", ")})`;
  }

  // Translate back to 0,0 in top left, for focus labels
  private translateBack(point: [number, number]) {
    const currentTranslation: [number, number] = this.currentTranslation;
    return [point[0] + currentTranslation[0], point[1] + currentTranslation[1]];
  }

  // Helper functions for finding / filtering / comparing nodes
  private isEqual(d1: HierarchyDatum) {
    return (d2: HierarchyDatum) =>
      Boolean(d1) && Boolean(d2) && every(identity)([d1.data.name === d2.data.name, this.isSibling(d1)(d2)]);
  }

  private isSibling(d1: HierarchyDatum) {
    return (d2: HierarchyDatum) => {
      if (!d1.parent && !d2.parent) {
        return true;
      }
      return (
        !!d1.parent &&
        !!d2.parent &&
        every(identity)([d1.depth === d2.depth, d1.parent.data.name === d2.parent.data.name])
      );
    };
  }

  private findSiblings(data: HierarchyDatum[], d: HierarchyDatum) {
    return filter(this.isSibling(d))(data);
  }

  private findAncestor(data: HierarchyDatum[], d: HierarchyDatum): HierarchyDatum | undefined {
    if (!d || !d.parent) {
      return;
    }
    const parent = find(this.isEqual(d.parent))(data);
    return parent || this.findAncestor(data, d.parent);
  }

  private findDatum(data: HierarchyDatum[], d: HierarchyDatum) {
    return find(this.isEqual(d))(data);
  }

  // Arc interpolations for entering segments
  private arcTween(d: HierarchyDatum) {
    const previousData = this.previous || [],
      // old version of same datum
      old = find(this.isEqual(d))(previousData),
      // nearest ancestor that already exists
      oldParent = this.findAncestor(previousData.concat([this.dataHandler.topNode]), d);

    let x0: number;
    let x1: number;
    let y0: number;
    let y1: number;
    if (old) {
      x0 = old.x0;
      x1 = old.x1;
      y0 = old.y0;
      y1 = old.y1;
    } else if (!old && oldParent) {
      // find siblings - same parent, same depth
      const siblings = this.findSiblings(this.data, d);
      const siblingIndex = findIndex(this.isEqual(d))(siblings);
      const oldPrecedingSibling = this.findDatum(previousData, siblings[siblingIndex - 1]);

      x0 = oldPrecedingSibling ? oldPrecedingSibling.x1 : oldParent.x0;
      x1 = oldPrecedingSibling ? oldPrecedingSibling.x1 : oldParent.x0;
      y0 = d.y0;
      y1 = d.y1;
    } else {
      x0 = 0;
      x1 = 0;
      y0 = d.y0;
      y1 = d.y1;
    }

    const f = d3InterpolateObject({ x0, x1, y0, y1 }, d);
    return (t: number) => this.arc(f(t)) as string;
  }

  // Arc interpolations for exiting segments
  private removeArcTween(d: HierarchyDatum) {
    const oldSiblings = this.findSiblings(this.previous || [], d);
    const currentSiblings = this.findSiblings(this.data, d);
    const oldSiblingIndex = findIndex(this.isEqual(d))(oldSiblings);
    const oldPrecedingSibling: HierarchyDatum = (filter as WithConvert<LodashFilter>)
      .convert({ cap: false })(
        (sibling: HierarchyDatum, i: number) => i < oldSiblingIndex && !!this.findDatum(currentSiblings, sibling),
      )(oldSiblings)
      .pop();
    const precedingSibling = this.findDatum(this.data, oldPrecedingSibling);
    const parent = this.findAncestor(this.data.concat([this.dataHandler.topNode]), d);

    let x: number = 0;
    if (precedingSibling) {
      x = precedingSibling.x1;
    } else if (parent) {
      x = parent.x0;
    }

    const f = d3InterpolateObject({ x0: x, x1: x }, d);
    return (t: number) => this.arc(f(1 - t)) as string;
  }

  // Event handlers
  private onClick(payload: ClickPayload) {
    // Don't allow zooming on last child
    if (payload.d && !payload.d.children) {
      return;
    }

    const zoomNode = payload.d || this.dataHandler.topNode;

    // If the center node is clicked, zoom out by one level
    if (zoomNode === this.zoomNode && payload && payload.force) {
      this.zoomOut(payload);
      return;
    }

    // Set new scale domains
    const config = this.state.current.getConfig();

    let maxChildRadius: number = 0;
    let truncated: boolean = false;
    forEach((child: HierarchyDatum) => {
      if (child.depth - zoomNode.depth <= this.state.current.getConfig().maxRings) {
        maxChildRadius = Math.max(maxChildRadius, child.y1);
      } else {
        truncated = true;
      }
    })(zoomNode.descendants());

    // If any paths are truncated, reduce radius scale range to allow space for arrow markers
    this.radiusScale.range([0, this.radius - (truncated ? config.arrowOffset + spaceForArrow : 0)]);

    // Angle and radius domains
    const angleDomain = d3Interpolate(this.angleScale.domain(), [zoomNode.x0, zoomNode.x1]);
    const radiusDomain = d3Interpolate(this.radiusScale.domain(), [zoomNode.y0, maxChildRadius]);

    // Save new inner radius to facilitate sizing and positioning of root label
    this.radiusScale.domain(radiusDomain(1));
    const innerRadius = this.radiusScale(zoomNode.y1);
    this.stateWriter("innerRadius", innerRadius);

    // If the sunburst is not zoomed in and the root node is fully surrounded by children,
    // make the radius of the central white circle equal to the inner radius of the first ring,
    // to avoid an extra grey ring around the root node.
    const totalRootChildValue = reduce((memo: number, child: HierarchyDatum) => {
      return memo + child.data.value;
    }, 0)(this.dataHandler.topNode.children);
    const isSurrounded = zoomNode === this.dataHandler.topNode && zoomNode.data.value === totalRootChildValue;

    document.hidden || config.disableAnimations
      ? this.el
          .select(`circle.${styles.centerCircle}`)
          .attr("r", innerRadius * (isSurrounded ? 1 : config.centerCircleRadius))
      : this.el
          .select(`circle.${styles.centerCircle}`)
          .transition()
          .duration(config.duration)
          .attr("r", innerRadius * (isSurrounded ? 1 : config.centerCircleRadius));

    // If no payload has been sent (resetting zoom) and the chart hasn't already been zoomed
    // (occurs when no zoom config is passed in from the outside)
    // no need to do anything.
    if (!this.zoomNode && (!payload.d || payload.d === this.dataHandler.topNode)) {
      return;
    }

    this.zoomNode = zoomNode;
    this.stateWriter("zoomNode", this.zoomNode);

    this.removeTruncationArrows();

    const paths = this.el
      .selectAll(`path.${styles.arc}`)
      .attr("pointer-events", "none")
      .classed("zoomed", datum => datum === this.zoomNode)
      .classed(
        "empty",
        datum => Boolean((datum as HierarchyDatum).data.empty) && this.isFirstLevelChild(datum as HierarchyDatum),
      )
      .each(
        withD3Element((_: HierarchyDatum, el: Element) => {
          d3.select(el).attr("pointer-events", null);
        }),
      );

    if (document.hidden) {
      this.angleScale.domain(angleDomain(1));
      paths.attr("d", d => this.arc(d as HierarchyDatum));
    } else {
      paths
        .transition()
        .duration(config.duration)
        .tween("scale", () => {
          return (t: number) => {
            this.angleScale.domain(angleDomain(t));
            this.radiusScale.domain(radiusDomain(t));
          };
        })
        .attrTween("d", datum => {
          return () => this.arc(datum as HierarchyDatum) as string;
        })
        .call(onTransitionEnd, this.updateTruncationArrows.bind(this));
    }
  }

  private zoomOut(payload: ClickPayload) {
    this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d: payload.d ? payload.d.parent : undefined });
  }

  private onMouseOver(d: HierarchyDatum, el: Element) {
    if (d === this.zoomNode) {
      return;
    }
    if (d.data.empty && !this.isFirstLevelChild(d)) {
      return;
    }

    const labelPosition = this.arc.centroid(d)[1] > 0 ? "below" : "above";
    const hideLabel = d3.select(el).classed(styles.arrow);
    this.events.emit(Events.FOCUS.ELEMENT.HOVER, {
      d,
      hideLabel,
      focusPoint: { labelPosition, centroid: this.getFocusPoint(d) },
    });

    this.mouseOverDatum = d;
    this.highlightPath(d, el);
  }

  private getFocusPoint(d: HierarchyDatum) {
    const r = (3 * this.arc.outerRadius()(d) + this.arc.innerRadius()(d)) / 4;
    const a = (this.arc.startAngle()(d) + this.arc.endAngle()(d)) / 2 - Math.PI / 2;
    return this.translateBack([Math.cos(a) * r, Math.sin(a) * r]);
  }

  private highlightPath(d: HierarchyDatum, el: Element) {
    const percentage: number = Number(((100 * d.data.value) / this.total).toPrecision(3));

    this.el.select("span.percentage").text(percentage < 0.1 ? "< 0.1%" : `${percentage}%`);

    this.el.select("div.explanation").style("visibility", "");

    const sequenceArray = d.ancestors();
    sequenceArray.pop(); // remove root node from the array

    // Fade all the segments (leave inner circle as is).
    this.el
      .selectAll(`path.${styles.arc}`)
      .filter(datum => datum !== this.zoomNode)
      .style("opacity", 0.5);

    // Then highlight only those that are an ancestor of the current segment.
    this.el
      .selectAll(`path.${styles.arc}`)
      .filter(datum => sequenceArray.indexOf(datum as HierarchyDatum) >= 0 && datum !== this.zoomNode)
      .style("opacity", 1);

    d3.select(el).on("mouseleave", this.onMouseLeave.bind(this)(d));
  }

  private onMouseLeave(d: HierarchyDatum) {
    return () => {
      if (this.mouseOverDatum !== d) {
        return;
      }
      this.mouseOverDatum = undefined;

      // Remove focus label
      this.events.emit(Events.FOCUS.ELEMENT.OUT);

      this.el
        .selectAll(`path.${styles.arc}`)
        .filter(datum => datum !== this.zoomNode)
        .style("opacity", 1);

      this.el.select("div.explanation").style("visibility", "hidden");
    };
  }

  // Arrows to denote path truncation
  private removeTruncationArrows() {
    this.el
      .select("g.arrows")
      .selectAll("path")
      .remove();
  }

  private arrowTransformation(d: HierarchyDatum): string {
    const radAngle: number = d3Interpolate(this.angleScale(d.x0), this.angleScale(d.x1))(0.5);
    const degAngle: number = (radAngle * 180) / Math.PI;
    const r: number = this.radiusScale(d.y1) + this.state.current.getConfig().arrowOffset;
    return `translate(0, ${-r}) rotate(${degAngle} 0 ${r})`;
  }

  private updateTruncationArrows() {
    const centerNode = this.zoomNode || this.dataHandler.topNode;
    const config = this.state.current.getConfig();

    const data: HierarchyDatum[] = map(get("parent"))(
      filter((d: HierarchyDatum) => {
        return (
          d.depth - centerNode.depth > config.maxRings &&
          !!d.parent &&
          d.parent.depth - centerNode.depth <= config.maxRings
        );
      })(this.data),
    );

    const arrows = this.el
      .select("g.arrows")
      .attr("transform", this.translate())
      .selectAll(`path.${styles.arrow}`)
      .data(data, get("name"));

    arrows.exit().remove();

    arrows
      .enter()
      .append("svg:path")
      .attr("class", styles.arrow)
      .merge(arrows)
      .attr("d", arrowPath)
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)))
      .on("click", (d: HierarchyDatum) => this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d, force: true }))
      .attr("transform", this.arrowTransformation.bind(this));
  }
}

export default Renderer;
