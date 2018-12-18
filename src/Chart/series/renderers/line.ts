import { compact, defaults, find, forEach, get, map, sortBy } from "lodash/fp";
import { AxisComputed } from "../../../axis_utils/typings";
import Series from "../series";
import * as styles from "./styles";

import {
  curveCardinal,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line as d3Line,
} from "d3-shape";

import {
  AxisOrientation,
  D3Selection,
  Datum,
  LineRendererAccessors,
  RendererClass,
  RendererType,
  SingleRendererOptions,
  State,
} from "../../typings";

export type Options = SingleRendererOptions<LineRendererAccessors>;

const defaultAccessors: LineRendererAccessors = {
  color: (series: Series) => series.legendColor(),
  dashed: () => false,
  interpolate: () => "linear",
  closeGaps: () => true,
  opacity: () => 1,
};

const interpolator = {
  cardinal: curveCardinal,
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
};

const hasValue = (d: any): boolean => {
  return !!d || d === 0;
};

class Line implements RendererClass<LineRendererAccessors> {
  private data!: Datum[];
  private el: D3Selection;
  public options!: Options;
  private series: Series;
  private state: State;
  public type: RendererType = "line";
  private xIsBaseline!: boolean;
  // Accessors
  private closeGaps!: () => boolean;
  private color!: () => string;
  private dashed!: () => boolean;
  private interpolate!: () => any;
  private opacity!: () => number;
  private x!: (d: Datum) => any;
  private adjustedX!: (d: Datum) => number;
  private xScale: any;
  private y!: (d: Datum) => any;
  private adjustedY!: (d: Datum) => number;
  private yScale: any;

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
    this.data = data;
  }

  public draw() {
    this.setAxisScales();
    this.addMissingData();

    const data = sortBy((d: Datum) => (this.xIsBaseline ? this.x(d) : this.y(d)))(this.data);
    const duration = this.state.current.getConfig().duration;

    const line = this.el.selectAll("path").data([data]);

    line
      .enter()
      .append("svg:path")
      .attr("d", this.startPath.bind(this))
      .merge(line)
      .attr("class", this.dashed() ? "dashed" : "")
      .style("stroke", this.color.bind(this))
      .transition()
      .duration(duration)
      .attr("d", this.path.bind(this))
      .attr("opacity", this.opacity.bind(this));

    line
      .exit()
      .transition()
      .duration(duration)
      .attr("d", d => this.startPath(d as Datum[]))
      .remove();
  }

  public close() {
    this.el.remove();
  }

  public dataForAxis(axis: AxisOrientation) {
    const axisValue = axis === "x" ? this.x : this.y;
    const data = map(axisValue)(this.data)
      .concat(map(get(`${axis}0`))(this.data))
      .concat(map(get(`${axis}1`))(this.data));
    return compact(data);
  }

  // Private methods
  private appendSeriesGroup(el: D3Selection): D3Selection {
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.line}`);
  }

  private assignAccessors(customAccessors: Partial<LineRendererAccessors> = {}) {
    const accessors: LineRendererAccessors = defaults(defaultAccessors)(customAccessors);
    this.x = (d: Datum) => (hasValue(this.series.x(d)) ? this.series.x(d) : d.injectedX);
    this.y = (d: Datum) => (hasValue(this.series.y(d)) ? this.series.y(d) : d.injectedY);
    this.color = () => accessors.color(this.series);
    this.dashed = () => accessors.dashed(this.series);
    this.interpolate = () => interpolator[accessors.interpolate(this.series) as keyof typeof interpolator];
    this.closeGaps = () => accessors.closeGaps(this.series);
    this.opacity = () => accessors.opacity(this.series);
  }

  private setAxisScales() {
    this.xIsBaseline = this.state.current.getComputed().axes.baseline === "x";
    const computedAxes = this.state.current.getComputed().axes.computed;
    this.xScale = (computedAxes[this.series.xAxis()] as AxisComputed).scale;
    this.yScale = (computedAxes[this.series.yAxis()] as AxisComputed).scale;
    this.adjustedX = (d: Datum) => this.xScale(this.xIsBaseline ? this.x(d) : hasValue(d.x1) ? d.x1 : this.x(d));
    this.adjustedY = (d: Datum) => this.yScale(this.xIsBaseline ? (hasValue(d.y1) ? d.y1 : this.y(d)) : this.y(d));
  }

  private addMissingData() {
    if (this.closeGaps()) {
      return;
    }
    if (this.xIsBaseline && !this.series.options.stacked) {
      const ticks = this.state.current.getComputed().series.dataForAxes[this.series.xAxis()];
      forEach((tick: any) => {
        if (!find((d: Datum) => this.x(d).toString() === tick.toString())(this.data)) {
          this.data.push({ injectedX: tick, injectedY: undefined });
        }
      })(ticks);
    }
  }

  private isDefined(d: Datum): boolean {
    return this.series.options.stacked && this.closeGaps() ? true : hasValue(this.x(d)) && hasValue(this.y(d));
  }

  private startPath(data: Datum[]): string {
    return (d3Line() as any)
      .x(this.xIsBaseline ? this.adjustedX : this.xScale(0))
      .y(this.xIsBaseline ? this.yScale(0) : this.adjustedY)
      .curve(this.interpolate())
      .defined(this.isDefined.bind(this))(data);
  }

  private path(data: Datum[]): string {
    return (d3Line() as any)
      .x(this.adjustedX)
      .y(this.adjustedY)
      .curve(this.interpolate())
      .defined(this.isDefined.bind(this))(data);
  }
}

export default Line;
