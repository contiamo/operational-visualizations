import { interpolateObject } from "d3-interpolate";
import { arc as d3Arc } from "d3-shape";
import "d3-transition";
import { defaults, find, map } from "lodash/fp";
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
} from "../typings";

const ANGLE_RANGE: [number, number] = [0, 2 * Math.PI];
const TOTAL_Y_OFFSET = "0.35em";

class Donut implements Renderer {
  private color!: RendererAccessor<string>;
  private computed!: ComputedData;
  private currentTranslation!: [number, number];
  private data!: Datum[];
  private drawn: boolean = false;
  private el: D3Selection;
  private events: EventEmitter;
  private inputData!: InputData;
  private previousComputed!: Partial<ComputedData>;
  public key!: RendererAccessor<string>;
  public state: State;
  public type: RendererType = "donut";
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
    this.currentTranslation = Utils.computeTranslate(drawingDims);
    this.el.attr("transform", Utils.translateString(this.currentTranslation));

    // Arcs
    const arcs = Utils.createArcGroups(this.el, this.computed.data, this.key);
    // Exit
    Utils.exitArcs(arcs, duration, this.removeArcTween.bind(this));
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
    const options = { maxTotalFontSize, minTotalFontSize, innerRadius: this.computed.rInner, yOffset: TOTAL_Y_OFFSET };
    Utils.updateTotal(this.el, this.centerDisplayString(), options);
  }

  private arcAttributes() {
    return {
      path: this.arcTween.bind(this),
      fill: this.color.bind(this),
      isTween: true,
    };
  }

  // Interpolate the arcs in data space.
  private arcTween(d: ComputedDatum) {
    const previousData = this.previousComputed.data || [];
    const old = find((datum: ComputedDatum) => datum.index === d.index)(previousData);
    const previous = find((datum: ComputedDatum) => datum.index === d.index - 1)(previousData);
    const last = previousData[previousData.length - 1];

    let s0: number;
    let e0: number;
    if (old) {
      s0 = old.startAngle;
      e0 = old.endAngle;
    } else if (!old && previous) {
      s0 = previous.endAngle;
      e0 = previous.endAngle;
    } else if (!previous && previousData.length > 0) {
      s0 = last.endAngle;
      e0 = last.endAngle;
    } else {
      s0 = 0;
      e0 = 0;
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

  private removeArcTween(d: ComputedDatum) {
    let s0: number;
    let e0: number;
    s0 = e0 = ANGLE_RANGE[1];
    const f = interpolateObject({ endAngle: d.endAngle, startAngle: d.startAngle }, { endAngle: e0, startAngle: s0 });
    return (t: number) => this.computed.arc(f(t));
  }

  private centerDisplayString(): string {
    return this.computed.rInner > 0 ? this.computed.total.toString() : "";
  }

  // Data computation / preparation
  private compute() {
    this.previousComputed = this.computed;

    const d = {
      layout: Utils.layout(this.angleValue.bind(this), ANGLE_RANGE),
      total: Utils.computeTotal(this.inputData, this.value),
    };

    // data should not become part of this.previousComputed in first computation
    this.previousComputed = defaults(d)(this.previousComputed);

    this.data = Utils.computePercentages(this.inputData, this.angleValue.bind(this), d.total);

    this.computed = {
      ...d,
      ...this.computeArcs(),
      data: d.layout(this.data),
    };
  }

  private angleValue(d: InputDatum) {
    return this.value(d) || d.value || 0;
  }

  private computeArcs(): ComputedArcs {
    const drawingDims = this.state.current.getComputed().canvas.drawingContainerDims;
    const r = this.computeOuterRadius(drawingDims);
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

  private computeOuterRadius(drawingDims: Dimensions): number {
    const outerBorderMargin = this.state.current.getConfig().outerBorderMargin;
    return Math.min(drawingDims.width, drawingDims.height) / 2 - outerBorderMargin;
  }

  private computeInnerRadius(outerRadius: number): number {
    const config = this.state.current.getConfig();
    const width = outerRadius - config.minInnerRadius;
    // If there isn't enough space, don't render inner circle
    return width < config.minWidth ? 0 : outerRadius - Math.min(width, config.maxWidth);
  }

  // Event listeners / handlers
  private onMouseOver(d: ComputedDatum) {
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
    return map(
      (datum: InputDatum): LegendDatum => {
        return {
          label: this.key(datum),
          color: this.color(datum),
        };
      },
    )(this.inputData);
  }

  // Remove & clean up
  public remove() {
    if (this.drawn) {
      this.el.remove();
      this.drawn = false;
    }
  }
}

export default Donut;
