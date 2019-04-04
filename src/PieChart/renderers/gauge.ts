import { interpolateObject } from "d3-interpolate";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { arc as d3Arc } from "d3-shape";
import "d3-transition";
import { defaults, filter, find, findIndex, forEach, last, LodashForEach, map, reduce } from "lodash/fp";
import Events from "../../shared/event_catalog";
import { setPathAttributes, setTextAttributes } from "../../utils/d3_utils";
import * as Utils from "./renderer_utils";
import * as styles from "./styles";

import {
  ComputedArcs,
  ComputedData,
  ComputedDatum,
  D3Selection,
  Datum,
  DatumInfo,
  Dimensions,
  EventEmitter,
  HoverPayload,
  InputData,
  InputDatum,
  LegendDatum,
  Renderer,
  RendererAccessor,
  RendererType,
  State,
  WithConvert,
} from "../typings";

class Gauge implements Renderer {
  private color!: RendererAccessor<string>;
  private comparison!: Datum;
  private computed!: ComputedData;
  private currentTranslation!: [number, number];
  private data!: Datum[];
  private drawn: boolean = false;
  private el: D3Selection;
  private events: EventEmitter;
  private extent!: "semi" | "full";
  private inputData!: InputData;
  private previousComputed!: Partial<ComputedData>;
  private target!: number;
  private total!: number;
  public key!: RendererAccessor<string>;
  public state: State;
  public type: RendererType = "gauge";
  public value!: RendererAccessor<number>;

  constructor(state: State, events: EventEmitter, el: D3Selection, options: { [key: string]: any }) {
    this.state = state;
    this.events = events;
    this.el = el;
    this.updateOptions(options);
    this.events.on(Events.FOCUS.ELEMENT.HIGHLIGHT, this.highlightElement.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.HOVER, this.updateElementHover.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.updateElementHover.bind(this));
    this.events.on(Events.CHART.OUT, this.updateElementHover.bind(this));
  }

  // Initialization and updating config or accessors
  public updateOptions(options: { [key: string]: any }) {
    Utils.assignOptions(this, options);
  }

  public setData(data: InputData) {
    this.inputData = data || [];
  }

  // Drawing
  public draw() {
    this.compute();
    this.drawn ? this.updateDraw() : this.initialDraw();
  }

  private initialDraw() {
    // groups
    this.el.append("svg:g").attr("class", "arcs");
    this.el.append("svg:g").attr("class", styles.total);
    this.updateDraw();
    this.drawn = true;
  }

  private updateDraw() {
    const config = this.state.current.getConfig();
    const duration = config.duration;
    const maxTotalFontSize = config.maxTotalFontSize;
    const minTotalFontSize = config.minTotalFontSize;
    const drawingDims = this.state.current.getComputed().canvas.drawingContainerDims;

    // Remove focus before updating chart
    this.events.emit(Events.FOCUS.ELEMENT.OUT);

    // Center coordinate system
    this.currentTranslation = Utils.computeTranslate(drawingDims, this.extent === "semi" ? this.computed.r : 0);
    this.el.attr("transform", Utils.translateString(this.currentTranslation));

    // Arcs
    const arcs = Utils.createArcGroups(this.el, this.computed.data, this.key);
    // Exit
    Utils.exitArcs(arcs, duration, Utils.removeArcTween(this.computed, this.angleRange()));
    // Enter
    Utils.enterArcs(arcs, this.onMouseOver.bind(this), this.onMouseOut.bind(this));
    // Update
    const updatingArcs = arcs.merge(arcs.enter().selectAll(`g.${styles.arc}`));
    setPathAttributes(updatingArcs.select("path"), this.arcAttributes(), duration);

    updatingArcs.select("rect").attr("visibility", "hidden");
    setTextAttributes(updatingArcs.select("text"), Utils.textAttributes(this.computed), duration, () =>
      Utils.updateBackgroundRects(
        updatingArcs,
        this.computed.arcOver.centroid,
        config.displayPercentages ? "visible" : "hidden",
      ),
    );

    // Total / center text
    const options = {
      maxTotalFontSize,
      minTotalFontSize,
      innerRadius: this.computed.rInner,
      yOffset: this.totalYOffset(),
    };
    Utils.updateTotal(this.el, this.centerDisplayString(), options);
    // Comparison line
    this.updateComparison();
  }

  private arcAttributes() {
    return {
      path: this.arcTween.bind(this),
      fill: this.arcColor.bind(this),
      isTween: true,
    };
  }

  private arcColor(d: Datum) {
    return this.color(d);
  }

  private angleRange(): [number, number] {
    return this.extent === "semi" ? [-Math.PI / 2, Math.PI / 2] : [-Math.PI, Math.PI];
  }

  private totalYOffset() {
    return this.extent === "semi" ? "0" : "0.35em";
  }

  // Interpolate the arcs in data space.
  private arcTween(d: ComputedDatum, i: number) {
    const angleRange = this.angleRange();
    let old: any;
    let s0: number;
    let e0: number;

    // Segments transition to and from the start/left of the gauge.
    if (!d.data.unfilled) {
      old =
        filter(
          (datapoint: ComputedDatum): boolean => {
            return !datapoint.data.unfilled;
          },
        )(this.previousComputed.data) || [];

      if (old[i]) {
        s0 = old[i].startAngle;
        e0 = old[i].endAngle;
      } else if (!old[i] && old[i - 1]) {
        s0 = old[i - 1].endAngle;
        e0 = old[i - 1].endAngle;
      } else if (!old[i - 1] && old.length > 0) {
        s0 = old[old.length - 1].endAngle;
        e0 = old[old.length - 1].endAngle;
      } else {
        s0 = angleRange[0];
        e0 = angleRange[0];
      }
      // The unfilled part of the gauge transitions to and from the end/right of the gauge.
    } else {
      old = find(
        (datapoint: ComputedDatum): boolean => {
          return datapoint.data.unfilled;
        },
      )(this.previousComputed.data);
      if (old) {
        s0 = old.startAngle;
        e0 = old.endAngle;
      } else if (!this.previousComputed.data) {
        s0 = angleRange[0];
        e0 = angleRange[1];
      } else {
        s0 = angleRange[1];
        e0 = angleRange[1];
      }
    }

    const innerRadius = this.previousComputed.rInner || this.computed.rInner;
    const outerRadius = this.previousComputed.r || this.computed.r;
    const f = interpolateObject(
      { innerRadius, outerRadius, endAngle: e0, startAngle: s0 },
      {
        innerRadius: this.computed.rInner,
        outerRadius: this.computed.r,
        endAngle: d.endAngle,
        startAngle: d.startAngle,
      },
    );
    return (t: number) => this.computed.arc(f(t));
  }

  private lineTween(comparison: Datum) {
    // Need to rotate range by 90 degrees, since in d3 pie layout, '0' is vertical above origin.
    // Here, we need '0' to be horizontal to left of origin.
    const range = map((value: number): number => value + Math.PI / 2)(this.angleRange());
    const angle = (d: any) =>
      d3ScaleLinear()
        .range(range)
        .domain([0, this.target])(d.value);
    const xOuter = (d: any) => -d.r * Math.cos(angle(d));
    const yOuter = (d: any) => -d.r * Math.sin(angle(d));
    const xInner = (d: any) => -d.inner * Math.cos(angle(d));
    const yInner = (d: any) => -d.inner * Math.sin(angle(d));
    const path = (d: any) => `M${[xInner(d), yInner(d)].join(",")}L${[xOuter(d), yOuter(d)].join(",")}`;
    const oldValue = this.previousComputed.comparison ? this.value(this.previousComputed.comparison) : 0;
    const f = interpolateObject(
      {
        inner: this.previousComputed.rInner || this.computed.rInner,
        r: this.previousComputed.r || this.computed.r,
        value: oldValue,
      },
      { inner: this.computed.rInner, r: this.computed.r, value: this.value(comparison) },
    );
    return (t: number) => path(f(t));
  }

  private centerDisplayString(): string {
    return `${this.total} / ${this.target}`;
  }

  private updateComparison() {
    const comparison = this.el.selectAll(`g.${styles.comparison}`).data(this.comparison ? [this.comparison] : []);

    comparison.exit().remove();

    const enter = comparison
      .enter()
      .append("svg:g")
      .attr("class", styles.comparison);

    enter.append("svg:path");

    enter
      .merge(comparison)
      .transition()
      .duration(this.state.current.getConfig().duration)
      .select("path")
      .attrTween("d", this.lineTween.bind(this));
  }

  // Data computation / preparation
  private compute() {
    this.previousComputed = this.computed;
    this.total = Utils.computeTotal(this.inputData, this.value);

    this.fillGaugeExtent();

    if (!this.target) {
      throw new Error("No target value provided for gauge");
    }

    const d = {
      layout: Utils.layout(this.angleValue.bind(this), this.angleRange()),
      total: this.total,
      target: this.target,
    };

    // data should not become part of this.previousComputed in first computation
    this.previousComputed = defaults(d)(this.previousComputed);

    this.data = Utils.computePercentages(this.inputData, this.angleValue.bind(this), d.target);

    this.computed = {
      ...d,
      ...this.computeArcs(),
      data: d.layout(this.data),
      comparison: this.comparison,
    };
  }

  private angleValue(d: InputDatum) {
    return this.value(d) || d.value || 0;
  }

  // Ensure sum of rendered values is equal to gauge target value.
  private fillGaugeExtent() {
    const runningTotal = this.runningTotal();

    // If target has been exceeded, reduce last value(s)
    if (this.total >= this.target) {
      const index: number = findIndex((value: number): boolean => value >= this.target)(runningTotal);
      (forEach as WithConvert<LodashForEach>).convert({ cap: false })((datapoint: InputDatum, i: number) => {
        if (i === index) {
          datapoint.value = i > 0 ? this.target - runningTotal[i - 1] : this.target;
        } else if (i > index) {
          datapoint.value = 0;
        }
      })(this.inputData);
      // If target has not been reached, add an "unfilled" segment which will have no color,
      // and will not be hoverable.
    } else {
      this.inputData.push({
        unfilled: true,
        value: this.target - this.total,
      });
    }
  }

  private runningTotal(): number[] {
    return reduce((memo: number[], datapoint: Datum) => {
      const previous = last(memo) || 0;
      memo.push(previous + datapoint.value);
      return memo;
    }, [])(this.data);
  }

  private computeArcs(): ComputedArcs {
    const drawingDims = this.state.current.getComputed().canvas.drawingContainerDims;
    const outerBorderMargin = this.state.current.getConfig().outerBorderMargin;
    const r = this.computeOuterRadius(drawingDims, outerBorderMargin);
    const rInner = this.computeInnerRadius(r);
    const rHover = r + 1;
    const rInnerHover = Math.max(rInner - 1, 0);

    return {
      r,
      rInner,
      rHover,
      rInnerHover,
      arc: d3Arc(),
      arcOver: d3Arc()
        .innerRadius(rInnerHover)
        .outerRadius(rHover),
    };
  }

  private computeOuterRadius(drawingDims: Dimensions, margin: number): number {
    return this.extent === "full"
      ? Math.min(drawingDims.width, drawingDims.height) / 2 - margin
      : Math.min(drawingDims.width / 2, drawingDims.height) - margin;
  }

  private computeInnerRadius(outerRadius: any): number {
    const config = this.state.current.getConfig();
    const width = outerRadius - config.minInnerRadius;
    // If there isn't enough space, don't render inner circle
    return width < config.minWidth ? 0 : outerRadius - Math.min(width, config.maxWidth);
  }

  // Event listeners / handlers
  private onMouseOver(d: ComputedDatum) {
    if (d.data.unfilled) {
      this.events.emit(Events.FOCUS.ELEMENT.OUT);
      return;
    }
    const datumInfo: DatumInfo = {
      key: this.key(d),
      value: this.value(d),
      percentage: d.data.percentage,
    };
    const centroid = Utils.translateBack(this.computed.arcOver.centroid(d), this.currentTranslation);
    this.events.emit(Events.FOCUS.ELEMENT.HOVER, { d: datumInfo, focusPoint: { centroid } });
  }

  private updateElementHover(datapoint: HoverPayload) {
    if (!this.drawn) {
      return;
    }

    const arcs = this.el.select("g.arcs").selectAll("g");
    const filterFocused = (d: Datum) => datapoint.d && this.key(d) === datapoint.d.key;
    const filterUnFocused = (d: Datum) => (datapoint.d ? this.key(d) !== datapoint.d.key : true);

    Utils.updateFilteredPathAttributes(arcs, filterFocused, this.computed.arcOver);
    Utils.updateFilteredPathAttributes(
      arcs,
      filterUnFocused,
      this.computed.arc.innerRadius(this.computed.rInner).outerRadius(this.computed.r),
    );
  }

  private highlightElement(key: string) {
    const d = find((datum: ComputedDatum) => this.key(datum) === key)(this.computed.data);
    if (!d) {
      return;
    }
    this.onMouseOver(d);
  }

  private onMouseOut() {
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  // External methods
  public dataForLegend() {
    const data: LegendDatum[] = map(
      (datum: InputDatum): LegendDatum => {
        return {
          label: this.key(datum),
          color: this.color(datum),
        };
      },
    )(this.inputData);

    if (this.comparison) {
      data.push({
        label: this.key(this.comparison),
        comparison: true,
      });
    }
    return data;
  }

  // Remove & clean up
  public remove() {
    if (this.drawn) {
      this.el.remove();
      this.drawn = false;
    }
  }
}

export default Gauge;
