import * as d3 from "d3-selection";
import { symbol as d3Symbol, symbolCircle, symbolDiamond, symbolSquare } from "d3-shape";
import "d3-transition";
import { invoke } from "lodash/fp";
import Events from "../../shared/event_catalog";
import { onTransitionEnd, withD3Element } from "../../utils/d3_utils";
import { exitGroups, filterByMatchers, sizeScale } from "./renderer_utils";
import * as styles from "./styles";

import {
  D3Selection,
  EventEmitter,
  NodeFocusElement,
  ProcessFlowConfig,
  Renderer,
  Scale,
  State,
  TNode,
} from "../typings";

type Position = "top" | "bottom" | "middle" | "left" | "right";

type Option = "dy" | "textAnchor" | "x" | "y";

const nodeLabelOptions: Record<Position, Record<Option, any>> = {
  top: {
    dy: "0",
    textAnchor: "middle",
    x: 0,
    y: -1,
  },
  bottom: {
    dy: "1em",
    textAnchor: "middle",
    x: 0,
    y: 1,
  },
  middle: {
    dy: "0.35em",
    textAnchor: "middle",
    x: 0,
    y: 0,
  },
  left: {
    dy: "0.35em",
    textAnchor: "end",
    x: -1,
    y: 0,
  },
  right: {
    dy: "0.35em",
    textAnchor: "start",
    x: 1,
    y: 0,
  },
};

const nodeShapeOptions: { [key: string]: { [key: string]: any } } = {
  squareDiamond: {
    symbol: symbolSquare,
    rotation: 45,
  },
  square: {
    symbol: symbolSquare,
    rotation: 0,
  },
  diamond: {
    symbol: symbolDiamond,
    rotation: 0,
  },
  circle: {
    symbol: symbolCircle,
    rotation: 0,
  },
};

class Nodes implements Renderer<TNode, NodeFocusElement> {
  private config!: ProcessFlowConfig;
  private data!: TNode[];
  private el: D3Selection;
  private events: EventEmitter;
  private state: State;

  constructor(state: State, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.events = events;
    this.el = el;
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.removeHighlights.bind(this));
  }

  private onMouseOver(d: TNode, element: HTMLElement) {
    this.mouseOver(d3.select(element), d);
  }

  private mouseOver(element: D3Selection, d: TNode, hideLabel: boolean = false) {
    this.highlight(element, d);
    const focusPoint = this.focusPoint(element, d);
    this.events.emit(Events.FOCUS.ELEMENT.HOVER, { focusPoint, d, hideLabel });
    element.on("mouseleave", this.onMouseOut.bind(this));
  }

  public focusElement(focusElement: NodeFocusElement) {
    this.el
      .selectAll(`path.node.${styles.border}`)
      .filter(filterByMatchers(focusElement.matchers))
      .each(
        withD3Element((d: TNode, el: HTMLElement) => {
          this.mouseOver(d3.select(el), d, focusElement.hideLabel);
        }),
      );
  }

  public highlight(element: D3Selection, _: TNode, keepCurrent: boolean = false) {
    if (!keepCurrent) {
      this.removeHighlights();
    }
    element.attr("stroke", this.config.highlightColor);
  }

  // Remove any old highlights, including link highlighting (needed if an element has been manually focussed)
  private removeHighlights() {
    this.el.selectAll(`path.node.${styles.border}`).attr("stroke", this.config.borderColor);
    this.el.selectAll(`path.link.${styles.element}`).attr("stroke", invoke("stroke"));
  }

  private focusPoint(element: D3Selection, d: TNode) {
    if (d == null) {
      return;
    }
    const offset = this.getNodeBoundingRect(element.node()).width / 2;
    return {
      offset,
      type: "node",
      x: d.x,
      y: d.y,
      id: d.id(),
    };
  }

  private onMouseOut() {
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  public draw(data: TNode[]) {
    this.data = data;
    this.config = this.state.current.getConfig();
    const groups = this.el
      .select("g.nodes-group")
      .selectAll("g.node-group")
      .data(this.data, node => (node as TNode).id());

    exitGroups(groups);
    this.enterAndUpdate(groups);
  }

  private borderScale(scale: Scale): Scale {
    return (size: number) => {
      return Math.pow(Math.sqrt(scale(size)) + this.config.nodeBorderWidth, 2);
    };
  }

  private translate(d: TNode): string {
    return `translate(${d.x},${d.y})`;
  }

  private rotate(d: TNode): string {
    return `rotate(${nodeShapeOptions[d.shape()].rotation})`;
  }

  private enterAndUpdate(groups: D3Selection) {
    const scale = sizeScale([this.config.minNodeSize, this.config.maxNodeSize], this.data);
    const borderScale = this.borderScale(scale);

    const enteringGroups = groups
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", this.translate);

    enteringGroups
      .append("path")
      .attr("class", `node ${styles.border}`)
      .attr("d", (d: TNode) =>
        d3Symbol()
          .type(nodeShapeOptions[d.shape()].symbol)
          .size(borderScale(d.size()))(),
      )
      .attr("transform", this.rotate)
      .attr("fill", this.config.borderColor)
      // @TODO delegate to a single event listener at the SVG root and locate the node in question by an attribute.
      // Single event handlers should be attached to a non-svg node.
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)));

    enteringGroups
      .append("path")
      .attr("class", `node ${styles.element}`)
      .attr("d", (d: TNode) =>
        d3Symbol()
          .type(nodeShapeOptions[d.shape()].symbol)
          .size(scale(d.size()))(),
      )
      .attr("transform", this.rotate)
      .attr("fill", (d: TNode) => d.color())
      .attr("stroke", (d: TNode) => d.stroke())
      .attr("opacity", 0);

    enteringGroups.append("text").attr("class", styles.label);

    groups
      .merge(enteringGroups)
      .transition()
      .duration(this.config.duration)
      .attr("transform", this.translate);

    groups
      .merge(enteringGroups)
      .selectAll(`path.node.${styles.border}`)
      .data(this.data, node => (node as TNode).id())
      .transition()
      .duration(this.config.duration)
      // NOTE: changing shape from one with straight edges to a circle/one with curved edges throws errors,
      // but doesn't break the viz.
      .attr("d", d =>
        d3Symbol()
          .type(nodeShapeOptions[d.shape()].symbol)
          .size(borderScale(d.size()))(),
      )
      .attr("transform", d => this.rotate(d));

    groups
      .merge(enteringGroups)
      .selectAll(`path.node.${styles.element}`)
      .data(this.data, node => (node as TNode).id())
      .transition()
      .duration(this.config.duration)
      // NOTE: changing shape from one with straight edges to a circle/one with curved edges throws errors,
      // but doesn't break the viz.
      .attr("d", d =>
        d3Symbol()
          .type(nodeShapeOptions[d.shape()].symbol)
          .size(scale(d.size()))(),
      )
      .attr("transform", d => this.rotate(d))
      .attr("fill", d => d.color())
      .attr("stroke", d => d.stroke())
      .attr("opacity", 1)
      .call(onTransitionEnd, this.updateNodeLabels.bind(this));
  }

  private getNodeBoundingRect(el: HTMLElement): SVGRect {
    const node: any = d3
      .select(el.parentNode as any)
      .select(`path.node.${styles.element}`)
      .node();
    return node.getBoundingClientRect();
  }

  private getLabelPosition(d: TNode): string {
    return d.labelPosition() === "auto" ? this.getAutomaticLabelPosition(d) : d.labelPosition();
  }

  private getAutomaticLabelPosition(d: TNode): string {
    const columnSpacing = this.state.current.getComputed().series.horizontalNodeSpacing;
    return (d.x / columnSpacing) % 2 === 1 ? "top" : "bottom";
  }

  private getNodeLabelX(d: TNode, el: HTMLElement): number {
    const offset = this.getNodeBoundingRect(el).width / 2 + this.config.nodeBorderWidth + this.config.labelOffset;
    return nodeLabelOptions[this.getLabelPosition(d) as Position].x * offset;
  }

  private getNodeLabelY(d: TNode, el: HTMLElement): number {
    const offset = this.getNodeBoundingRect(el).height / 2 + this.config.nodeBorderWidth + this.config.labelOffset;
    return nodeLabelOptions[this.getLabelPosition(d) as Position].y * offset;
  }

  private getLabelText(d: TNode): string {
    // Pixel width of character approx 1/2 of font-size - allow 7px per character
    const desiredPixelWidth = this.state.current.getComputed().series.horizontalNodeSpacing;
    const numberOfCharacters = desiredPixelWidth / 7;
    return d.label().substring(0, numberOfCharacters) + (d.label().length > numberOfCharacters ? "..." : "");
  }

  private updateNodeLabels() {
    const labels: D3Selection = this.el
      .select("g.nodes-group")
      .selectAll(`text.${styles.label}`)
      .data(this.data, d => (d as TNode).id());

    labels
      .enter()
      .merge(labels)
      .text(d => this.getLabelText(d))
      .attr("x", withD3Element(this.getNodeLabelX.bind(this)))
      .attr("y", withD3Element(this.getNodeLabelY.bind(this)))
      .attr("dy", d => nodeLabelOptions[this.getLabelPosition(d) as Position].dy)
      .attr("text-anchor", d => nodeLabelOptions[this.getLabelPosition(d) as Position].textAnchor);
  }
}

export default Nodes;
