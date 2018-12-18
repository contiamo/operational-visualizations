import { compact, defaults, filter, forEach, get, isBoolean, LodashForEach, map } from "lodash/fp";
import { AxisComputed } from "../../../axis_utils/typings";
import Series from "../series";
import * as styles from "./styles";

import {
  AxisOrientation,
  D3Selection,
  Datum,
  RendererClass,
  RendererType,
  SingleRendererOptions,
  State,
  TextRendererAccessors,
  TextRendererConfig,
  WithConvert,
} from "../../typings";

export type Options = SingleRendererOptions<TextRendererAccessors>;

const defaultAccessors: TextRendererAccessors = {
  size: () => 10,
  opacity: () => 1,
};

const verticalTiltAngle = -60;
const horizontalTiltAngle = -30;

class Text implements RendererClass<TextRendererAccessors> {
  private data!: Datum[];
  private el: D3Selection;
  public options!: Options;
  private series: Series;
  private state: State;
  public type: RendererType = "text";
  private xIsBaseline!: boolean;
  // Accessors
  private size!: (d: Datum) => number;
  private opacity!: (d: Datum) => number;
  private x!: (d: Datum) => any;
  private xScale!: any;
  private y!: (d: Datum) => any;
  private yScale!: any;
  // Config
  private offset: number = 2;
  private tilt!: boolean;

  constructor(state: State, el: D3Selection, data: Datum[], options: Options, series: Series) {
    this.state = state;
    this.series = series;
    this.el = this.appendSeriesGroup(el);
    this.update(data, options);
  }

  // Public methods
  public update(data: Datum[], options: Options) {
    this.options = options;
    this.assignAccessors(options.accessors);
    this.assignConfig(options.config);
    this.data = data;
  }

  public dataForAxis(axis: AxisOrientation) {
    const axisValue = axis === "x" ? this.x : this.y;
    const data = map(axisValue)(this.data)
      .concat(map(get(`${axis}0`))(this.data))
      .concat(map(get(`${axis}1`))(this.data));
    return compact(data);
  }

  public draw() {
    this.setAxisScales();
    const data = filter((d: Datum) => this.validate(d))(this.data);
    const duration = this.state.current.getConfig().duration;
    const startAttributes = this.startAttributes();
    const attributes = this.attributes();

    const text: D3Selection = this.el.selectAll("text").data(data);

    text
      .enter()
      .append("text")
      .attr("x", startAttributes.x)
      .attr("y", startAttributes.y)
      .style("font-size", d => `${this.size(d)}px`)
      .text(startAttributes.text)
      .attr("text-anchor", attributes.anchor)
      .attr("transform", startAttributes.transform)
      .attr("dominant-baseline", attributes.baseline)
      .merge(text)
      .transition()
      .duration(duration)
      .attr("x", attributes.x)
      .attr("y", attributes.y)
      .attr("text-anchor", attributes.anchor)
      .attr("dominant-baseline", attributes.baseline)
      .style("font-size", d => `${this.size(d)}px`)
      .attr("opacity", d => this.opacity(d))
      .text(attributes.text)
      .attr("transform", attributes.transform);

    text
      .exit()
      .transition()
      .duration(duration)
      .attr("x", startAttributes.x)
      .attr("y", startAttributes.y)
      .text(startAttributes.text)
      .remove();
  }

  public close() {
    this.el.remove();
  }

  // Private methods
  private appendSeriesGroup(el: D3Selection): D3Selection {
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.text}`);
  }

  private assignAccessors(customAccessors: Partial<TextRendererAccessors> = {}) {
    const accessors = defaults(defaultAccessors)(customAccessors);
    this.x = (d: Datum) => this.series.x(d) || d.injectedX;
    this.y = (d: Datum) => this.series.y(d) || d.injectedY;
    this.size = (d: Datum) => accessors.size(this.series, d);
    this.opacity = (d: Datum) => accessors.opacity(this.series, d);
  }

  private assignConfig(customConfig: Partial<TextRendererConfig> = {}) {
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((value: any, key: string) => {
      (this as any)[key] = value;
    })(customConfig);
  }

  private setAxisScales() {
    this.xIsBaseline = this.state.current.getComputed().axes.baseline === "x";
    const computedAxes = this.state.current.getComputed().axes.computed;
    this.xScale = (computedAxes[this.series.xAxis()] as AxisComputed).scale;
    this.yScale = (computedAxes[this.series.yAxis()] as AxisComputed).scale;
    if (!isBoolean(this.tilt)) {
      this.tilt = this.xIsBaseline;
    }
  }

  private validate(d: Datum): boolean {
    return isFinite(this.xScale(this.x(d))) && isFinite(this.yScale(this.y(d)));
  }

  private startAttributes() {
    const barWidth = this.state.current.getComputed().axes.barPositions.width;
    const offset = barWidth ? barWidth(this.series.key()) / 2 : 0;
    const rotate = this.tilt ? (this.xIsBaseline ? verticalTiltAngle : horizontalTiltAngle) : 0;

    const attrs: any = {
      x: (d: Datum) => this.xScale(this.xIsBaseline ? this.x(d) : 0) - (this.xIsBaseline ? offset : 0),
      y: (d: Datum) => this.yScale(this.xIsBaseline ? 0 : this.y(d)) - (this.xIsBaseline ? 0 : offset),
      text: (d: Datum) => (this.xIsBaseline ? this.y(d) : this.x(d)).toString(),
    };
    attrs.transform = (d: Datum) => `rotate(${rotate}, ${attrs.x(d)}, ${attrs.y(d)})`;
    return attrs;
  }

  private attributes() {
    const barPositions = this.state.current.getComputed().axes.barPositions;
    const barWidth = barPositions.width;
    const barOffset = barPositions.offset;

    const offset = barWidth && barOffset ? barOffset(this.series.key()) + barWidth(this.series.key()) / 2 : 0;
    const symbolOffset = (d: Datum) => (this.series.symbolOffset ? this.series.symbolOffset(d) : 0) + this.offset;
    const rotate = this.tilt ? (this.xIsBaseline ? verticalTiltAngle : horizontalTiltAngle) : 0;
    const x = (d: Datum) => d.x1 || this.x(d);
    const y = (d: Datum) => d.y1 || this.y(d);
    const isPositive = (d: Datum) => (this.xIsBaseline ? y(d) >= 0 : x(d) >= 0);

    const attrs: any = {
      x: (d: Datum) => this.xScale(x(d)) + (this.xIsBaseline ? offset : symbolOffset(d) * (isPositive(d) ? 1 : -1)),
      y: (d: Datum) => this.yScale(y(d)) + (this.xIsBaseline ? symbolOffset(d) * (isPositive(d) ? -1 : 1) : offset),
      text: (d: Datum) => (this.xIsBaseline ? this.y(d) : this.x(d)).toString(),
      anchor: (d: Datum) => (this.xIsBaseline && !this.tilt ? "middle" : isPositive(d) ? "start" : "end"),
      baseline: this.xIsBaseline ? "initial" : "central",
    };
    attrs.transform = (d: Datum) => `rotate(${rotate}, ${attrs.x(d)}, ${attrs.y(d)})`;
    return attrs;
  }
}

export default Text;
