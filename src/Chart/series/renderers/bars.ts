import { area as d3Area, curveStepAfter } from "d3-shape";
import { clone, compact, defaults, filter, findKey, get, isFinite, last, map } from "lodash/fp";
import Events from "../../../shared/event_catalog";
import { setRectAttributes, withD3Element } from "../../../utils/d3_utils";
import Series from "../chart_series";
import * as styles from "./styles";

import {
  AxisOrientation,
  BarsRendererAccessors,
  D3Selection,
  Datum,
  EventEmitter,
  RendererClass,
  SingleRendererOptionsParam,
  State,
} from "../../typings";

export type Options = SingleRendererOptionsParam<BarsRendererAccessors, "bars">;

const defaultAccessors: BarsRendererAccessors = {
  color: (series: Series) => series.legendColor(),
  barWidth: () => undefined,
  opacity: () => 0.8,
};

class Bars implements RendererClass<BarsRendererAccessors, "bars"> {
  private data!: Datum[];
  private el: D3Selection;
  private events: EventEmitter;
  private isRange!: boolean;
  public options!: Options;
  private series: Series;
  private state: any;
  public type: "bars" = "bars";
  private xIsBaseline!: boolean;
  private xScale: any;
  private yScale: any;
  // Accessors
  public barWidth!: (d: Datum) => number | undefined;
  private color!: (d: Datum) => string;
  private focusContent!: (d: Datum) => Array<{ name: string; value: any }>;
  private opacity!: (d: Datum) => number;
  private x!: (d: Datum) => any;
  private x0!: (d: Datum) => number;
  private x1!: (d: Datum) => number;
  private y!: (d: Datum) => any;
  private y0!: (d: Datum) => number;
  private y1!: (d: Datum) => number;

  constructor(state: State, el: D3Selection, data: Datum[], options: Options, series: Series, events: EventEmitter) {
    this.state = state;
    this.events = events;
    this.series = series;
    this.el = this.appendSeriesGroup(el);
    this.update(data, options);
  }

  // Public methods
  public update(data: Datum[], options: Options) {
    this.options = options;
    this.assignAccessors(options.accessors);
    this.data = data;
    this.isRange = !!this.series.options.clipData;
  }

  public draw() {
    this.setAxisScales();
    this.updateClipPath();

    const data = filter((d: Datum) => this.validate(d))(this.data);
    const duration = this.state.current.getConfig().duration;
    this.el
      .transition()
      .duration(!!this.el.attr("transform") ? duration : 0)
      .attr("transform", this.seriesTranslation());

    const attributes = this.attributes();
    const startAttributes = this.startAttributes(attributes);

    const bars = this.el.selectAll("rect").data(data);

    bars
      .enter()
      .append("svg:rect")
      .call(setRectAttributes, startAttributes)
      .merge(bars)
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)))
      .on("mouseout", this.onMouseOut.bind(this))
      .on("click", withD3Element(this.onClick.bind(this)))
      .attr("clip-path", `url(#area-clip-${this.series.key()}`)
      .attr("opacity", this.opacity.bind(this))
      .call(setRectAttributes, attributes, duration);

    bars
      .exit()
      .call(setRectAttributes, startAttributes, duration)
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
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.bar}`);
  }

  private setAxisScales() {
    this.xIsBaseline = this.state.current.getComputed().axes.baseline === "x";
    const computedAxes = this.state.current.getComputed().axes.computed;
    this.xScale = computedAxes[this.series.xAxis()].scale;
    this.yScale = computedAxes[this.series.yAxis()].scale;
    this.x0 = (d: Datum) => {
      const baseline = this.isRange ? this.xScale.domain()[0] : 0;
      return this.xScale(
        this.xIsBaseline ? this.x(d) : Math.min(d.x0 || 0, d.x1 || 0) || (this.x(d) > baseline ? baseline : this.x(d)),
      );
    };
    this.x1 = (d: Datum) => {
      const baseline = this.isRange ? this.xScale.domain()[0] : 0;
      return this.xScale(
        this.xIsBaseline ? this.x(d) : Math.max(d.x0 || 0, d.x1 || 0) || (this.x(d) > baseline ? this.x(d) : baseline),
      );
    };
    this.y0 = (d: Datum) => {
      const baseline = this.isRange ? this.yScale.domain()[0] : 0;
      return this.yScale(
        this.xIsBaseline ? Math.min(d.y0 || 0, d.y1 || 0) || (this.y(d) > baseline ? baseline : this.y(d)) : this.y(d),
      );
    };
    this.y1 = (d: Datum) => {
      const baseline = this.isRange ? this.yScale.domain()[0] : 0;
      return this.yScale(
        this.xIsBaseline ? Math.max(d.y0 || 0, d.y1 || 0) || (this.y(d) > baseline ? this.y(d) : baseline) : this.y(d),
      );
    };
  }

  private validate(d: Datum) {
    return isFinite(this.xScale(this.x(d))) && isFinite(this.yScale(this.y(d)));
  }

  private assignAccessors(customAccessors: Partial<BarsRendererAccessors> = {}) {
    const accessors: BarsRendererAccessors = defaults(defaultAccessors)(customAccessors);
    this.x = (d: Datum) => this.series.x(d) || d.injectedX;
    this.y = (d: Datum) => this.series.y(d) || d.injectedY;
    this.color = (d: Datum) => accessors.color(this.series, d);
    this.barWidth = (d: Datum) => accessors.barWidth(this.series, d);
    this.focusContent = (d: Datum) =>
      accessors.focusContent ? accessors.focusContent(this.series, d) : this.defaultFocusContent(d);
    this.opacity = (d: Datum) => accessors.opacity(this.series, d);
  }

  private defaultFocusContent(d: Datum): Array<{ name: string; value: any }> {
    const xTitle = this.state.current.getAccessors().data.axes(this.state.current.getData())[this.series.xAxis()].title;
    const yTitle = this.state.current.getAccessors().data.axes(this.state.current.getData())[this.series.yAxis()].title;
    return xTitle || yTitle
      ? [
          {
            name: xTitle || "X",
            value: this.x(d),
          },
          {
            name: yTitle || "Y",
            value: this.y(d),
          },
        ]
      : [
          {
            name: this.xIsBaseline ? this.x(d) : this.y(d),
            value: this.xIsBaseline ? this.y(d) : this.x(d),
          },
        ];
  }

  private seriesTranslation(): string {
    const offset = this.state.current.getComputed().axes.barPositions.offset(this.series.key());
    return this.xIsBaseline ? `translate(${offset}, 0)` : `translate(0, ${offset})`;
  }

  private startAttributes(attributes: any) {
    return {
      x: this.xIsBaseline ? this.x0 : this.xScale(0),
      y: this.xIsBaseline ? this.yScale(0) : this.y0,
      width: this.xIsBaseline ? attributes.width : 0,
      height: this.xIsBaseline ? 0 : attributes.height,
      color: attributes.color,
    };
  }

  private attributes() {
    const barWidth = this.state.current.getComputed().axes.barPositions.width(this.series.key());
    return {
      x: this.x0,
      y: this.y1,
      width: this.xIsBaseline ? barWidth : (d: Datum) => this.x1(d) - this.x0(d),
      height: this.xIsBaseline ? (d: Datum) => this.y0(d) - this.y1(d) : barWidth,
      color: this.color.bind(this),
    };
  }

  private onMouseOver(d: Datum, el: HTMLElement) {
    const isNegative = this.xIsBaseline ? this.y(d) < 0 : this.x(d) < 0;
    const dimensions = el.getBoundingClientRect();
    const barOffset = this.state.current.getComputed().axes.barPositions.offset(this.series.key());

    const focusPoint = {
      content: this.focusContent(d),
      position: this.xIsBaseline ? (isNegative ? "below" : "above") : isNegative ? "toLeft" : "toRight",
      offset: 0,
      focus: {
        x: this.xIsBaseline ? this.x1(d) + barOffset + dimensions.width / 2 : isNegative ? this.x0(d) : this.x1(d),
        y: this.xIsBaseline ? (isNegative ? this.y0(d) : this.y1(d)) : this.y1(d) + barOffset + dimensions.height / 2,
      },
    };

    this.events.emit(Events.FOCUS.ELEMENT.HOVER, focusPoint);
  }

  private onMouseOut() {
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  private onClick(d: Datum, el: HTMLElement) {
    this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d, el });
  }

  private updateClipPath() {
    if (!this.isRange) {
      return;
    }
    const duration = this.state.current.getConfig().duration;
    let data = this.series.options.clipData;

    // The curveStepAfter interpolation does not account for the width of the bars.
    // A dummy point is added to the data to prevent the clip-path from cutting off the last point.
    const dummyPoint = clone(this.xIsBaseline ? last(data) : data[0]);
    const baseKey = findKey((val: any) => val === (this.xIsBaseline ? this.series.x : this.series.y)(dummyPoint))(
      dummyPoint,
    );
    if (baseKey) {
      delete dummyPoint[baseKey];
    }
    this.xIsBaseline ? data.push(dummyPoint) : (data = [dummyPoint].concat(data));

    const clip = this.el.selectAll("clipPath path").data([data]);

    clip
      .enter()
      .append("svg:clipPath")
      .attr("id", `area-clip-${this.series.key()}`)
      .append("svg:path")
      .merge(clip)
      .transition()
      .duration(duration)
      .attr("d", this.clipPath.bind(this));

    clip.exit().remove();
  }

  private clipPath(data: any[]) {
    const barWidth = this.state.current.getComputed().axes.barPositions.width(this.series.key());
    const offset = this.state.current.getConfig().outerBarSpacing / 2;
    const clipPath = this.xIsBaseline ? this.xClipPath.bind(this) : this.yClipPath.bind(this);
    return clipPath(barWidth, offset)(data);
  }

  private xClipPath(barWidth: number, offset: number) {
    return d3Area()
      .x((d: Datum) => (this.x0(d) || this.xScale.range()[1] + barWidth) - offset)
      .y0(this.yScale.range()[1])
      .y1(this.y1 as any)
      .curve(curveStepAfter);
  }

  private yClipPath(barWidth: number, offset: number) {
    return d3Area()
      .x0(this.xScale.range()[1])
      .x1(this.x1 as any)
      .y((d: Datum) => (this.y0(d) || this.yScale.range()[0] + barWidth) - offset)
      .curve(curveStepAfter);
  }
}

export default Bars;
