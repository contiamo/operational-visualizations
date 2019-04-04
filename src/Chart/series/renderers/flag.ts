import * as d3 from "d3-selection";
import { assign, compact, defaults, filter, forEach, LodashForEach, map } from "lodash/fp";
import { AxisComputed } from "../../../axis_utils/typings";
import Events from "../../../shared/event_catalog";
import { setLineAttributes, setPathAttributes, withD3Element } from "../../../utils/d3_utils";
import Series from "../series";
import * as styles from "./styles";

import {
  AxisOrientation,
  AxisPosition,
  D3Selection,
  Datum,
  EventEmitter,
  FlagRendererAccessors,
  FlagRendererConfig,
  RendererClass,
  RendererType,
  SingleRendererOptions,
  State,
  WithConvert,
} from "../../typings";

const defaultAccessors: FlagRendererAccessors = {
  color: (series: Series, d: Datum) => d.color || series.legendColor(),
  description: (_: Series, d: Datum) => d.description || "",
  direction: (_: Series, d: Datum) => d.direction || "up",
  label: (_: Series, d: Datum) => d.label || "",
  opacity: () => 1,
};

export type Options = SingleRendererOptions<FlagRendererAccessors>;

class Flag implements RendererClass<FlagRendererAccessors> {
  private data!: Datum[];
  private el: D3Selection;
  private events: EventEmitter;
  public options!: Options;
  private position!: AxisOrientation;
  private scale: any;
  private series: Series;
  private state: State;
  public type: RendererType = "flag";
  // Accessors
  private color!: (d: Datum) => string;
  private description!: (d: Datum) => string;
  private direction!: (d: Datum) => "up" | "down";
  private label!: (d: Datum) => string;
  private opacity!: (d: Datum) => number;
  private x!: (d: Datum) => number | Date | string;
  private y!: (d: Datum) => number | Date | string;
  // Config
  private axis: AxisPosition = "x1";
  private axisOffset: number = 10;
  private axisPadding: number = 15;
  private flagHeight: number = 10;
  private flagWidth: number = 8;

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
    this.assignConfig(options.config);
    this.position = this.axis[0] as AxisOrientation;
    this.data = filter((d: Datum) => this.validate(this.position === "x" ? this.x(d) : this.y(d)))(data);
  }

  public draw() {
    this.setAxisScales();

    const data = this.data;
    const attributes = assign({ color: this.color })(this.getAttributes());
    const duration = this.state.current.getConfig().duration;
    const groups = this.el.selectAll("g").data(data);

    groups.exit().remove();

    const enteringGroups = groups.enter().append("svg:g");

    groups.merge(enteringGroups).attr("opacity", this.opacity.bind(this));

    // Lines
    enteringGroups.append("line").call(setLineAttributes, attributes);

    groups
      .merge(enteringGroups)
      .select("line")
      .call(setLineAttributes, attributes, duration);

    // Flags
    const flagAttributes = {
      stroke: this.color,
      fill: this.color,
      path: this.flagPath(attributes),
    };

    enteringGroups
      .append("svg:path")
      .attr("class", "flag")
      .call(setPathAttributes, flagAttributes);

    groups
      .merge(enteringGroups)
      .select("path.flag")
      .call(setPathAttributes, flagAttributes, duration);

    // Labels
    enteringGroups
      .append("svg:text")
      .style("fill", (d: Datum) => this.color(d))
      .text((d: Datum) => this.label(d))
      .each(withD3Element(this.positionLabel(attributes).bind(this)));

    groups
      .merge(enteringGroups)
      .select("text")
      .style("fill", (d: Datum) => this.color(d))
      .text((d: Datum) => this.label(d))
      .each(withD3Element(this.positionLabel(attributes).bind(this)));

    // Hoverable flags
    const hoverFlagAttributes = {
      fill: this.color,
      stroke: this.color,
      path: this.hoverFlagPath(attributes).bind(this),
    };

    enteringGroups
      .append("svg:path")
      .attr("class", "hover-flag")
      .on("mouseleave", withD3Element(this.onFlagLeave.bind(this)))
      .call(setPathAttributes, hoverFlagAttributes);

    groups
      .merge(enteringGroups)
      .select("path.hover-flag")
      .on("mouseenter", withD3Element(this.onFlagHover(attributes).bind(this)))
      .call(setPathAttributes, hoverFlagAttributes, duration);
  }

  public close() {
    this.el.remove();
  }

  public dataForAxis(axis: AxisOrientation) {
    return this.position === axis ? compact(map(this[axis])(this.data)) : [];
  }

  // Private methods
  private validate(d: string | number | Date): boolean {
    return !!d || d === 0;
  }

  private appendSeriesGroup(el: D3Selection): D3Selection {
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.flag}`);
  }

  private setAxisScales() {
    this.scale = (this.state.current.getComputed().axes.computed[this.axis] as AxisComputed).scale;
  }

  private assignAccessors(customAccessors: Partial<FlagRendererAccessors> = {}) {
    const accessors = defaults(defaultAccessors)(customAccessors);
    this.x = this.series.x;
    this.y = this.series.y;
    this.color = (d: Datum) => accessors.color(this.series, d);
    this.description = (d: Datum) => accessors.description(this.series, d);
    this.direction = (d: Datum) => accessors.direction(this.series, d);
    this.label = (d: Datum) => accessors.label(this.series, d);
    this.opacity = (d: Datum) => accessors.opacity(this.series, d);
  }

  private assignConfig(customConfig: Partial<FlagRendererConfig> = {}) {
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((value: any, key: string) => {
      (this as any)[key] = value;
    })(customConfig);
  }

  private getAttributes(): { [key: string]: any } {
    const isXAxis = this.position === "x";
    const value = isXAxis ? this.x : this.y;
    const scale = this.scale;
    const drawingDims = this.state.current.getComputed().canvas.drawingDims;

    switch (this.axis) {
      case "x1":
        return {
          x: (d: Datum) => scale(value(d)),
          y1: drawingDims.height,
          y2: this.axisOffset,
        };
      case "x2":
        return {
          x: (d: Datum) => scale(value(d)),
          y1: 0,
          y2: drawingDims.height - this.axisOffset,
        };
      case "y1":
        return {
          y: (d: Datum) => scale(value(d)),
          x1: 0,
          x2: drawingDims.width - this.axisOffset,
        };
      case "y2":
        return {
          y: (d: Datum) => scale(value(d)),
          x1: drawingDims.width,
          x2: this.axisOffset,
        };
      default:
        return {};
    }
  }

  private positionLabel(attributes: any) {
    return (d: Datum, el: HTMLElement) => {
      const label = d3.select(el).attr("transform", "rotate(0)"); // Undo any previous rotation before calculating label dimensions.

      const dimensions = el.getBoundingClientRect();
      const x = attributes.x ? attributes.x(d) : attributes.x2;
      const y = attributes.y ? attributes.y(d) : attributes.y2;
      const isXAxis = this.position === "x";
      const sign = isXAxis ? (attributes.y2 < attributes.y1 ? 1 : -1) : attributes.x2 < attributes.x1 ? 1 : -1;
      const coordinates = {
        x: isXAxis ? x : x + sign * this.flagHeight,
        y: isXAxis ? y + sign * this.flagHeight : y,
      };

      label
        .transition()
        .duration(this.state.current.getConfig().duration)
        .attr("x", coordinates.x)
        .attr("y", coordinates.y);

      const rotation = `rotate(${isXAxis ? -90 : 0}, ${coordinates.x}, ${coordinates.y})`;

      // Unless an event flag is at the top of the chart, move label to below the line.
      const dx = this.axis[1] === "1" ? -dimensions.width : 0;
      let dy = dimensions.height / 2;
      switch (this.position) {
        case "x":
          dy = dy * (this.direction(d) === "down" ? -1 : 1);
          break;
        case "y":
          dy = dy * (this.direction(d) === "down" || coordinates.y === 0 ? 1 : -1);
          break;
        default:
          throw new Error(`Invalid axis name ${this.axis}.`);
      }
      const translation = `translate(${dx}, ${dy})`;

      label.attr("transform", `${rotation} ${translation}`);
    };
  }

  private flagPath(attributes: any): (d: Datum) => string {
    let line: (d: Datum) => number;
    let sign: number;
    let tip: (d: Datum) => number;

    switch (this.position) {
      case "x":
        line = (d: Datum) => attributes.x(d) + (this.direction(d) === "up" ? -1 : 1);
        sign = attributes.y2 < attributes.y1 ? 1 : -1;
        tip = (d: Datum) => (this.direction(d) === "down" ? line(d) - this.flagWidth : line(d) + this.flagWidth);
        const y0 = attributes.y2;
        const y1 = y0 + (sign * this.flagHeight) / 2;
        const y2 = y0 + sign * this.flagHeight;
        return (d: Datum) => `M${line(d)}, ${y0} L${tip(d)}, ${y1} L${line(d)}, ${y2}`;
      case "y":
        line = (d: Datum) => attributes.y(d);
        sign = attributes.x2 < attributes.x1 ? 1 : -1;
        // If an event flag coincides with the x-axis, move the flag to the other side.
        tip = (d: Datum) =>
          line(d) === 0 || this.direction(d) === "down" ? line(d) + this.flagWidth : line(d) - this.flagWidth;
        const x0 = attributes.x2;
        const x1 = x0 + (sign * this.flagHeight) / 2;
        const x2 = x0 + sign * this.flagHeight;
        return (d: Datum) => `M${x0}, ${line(d)} L${x1}, ${tip(d)} L${x2}, ${line(d)} Z`;
      default:
        throw new Error("Invalid axis name '" + this.axis + "'.");
    }
  }

  private hoverFlagPath(attributes: any) {
    const height = 12;
    const width = 8;
    let bottom: number;
    let left: any;
    const margin = (axis: AxisPosition) =>
      this.state.current.getComputed().axes.margins[axis] || this.state.current.getConfig()[axis].margin;

    return (d: Datum) => {
      const line = Math.round(attributes[this.position](d));

      switch (this.position) {
        case "y":
          const dx =
            this.axis === "y1"
              ? -margin("y1") + (this.axisPadding - width) / 2 + 1
              : margin("y2") - width - (this.axisPadding - width) / 2;
          bottom = Math.max(line + height / 2, height);
          left = attributes.x1 + dx;
          break;
        default:
          const dy =
            this.axis === "x1"
              ? margin("x1") - (this.axisPadding - height) / 2
              : height - margin("x2") + (this.axisPadding - height) / 2;
          bottom = attributes.y1 + dy;
          left = line - width / 2;
      }

      const top = bottom - height;
      const middle = (top + bottom) / 2;
      const right = left + width;
      return `M${left},${bottom} L${left},${top} L${right},${top} L${right},${middle} L${left},${middle}`;
    };
  }

  private onFlagHover(attributes: any) {
    return (d: Datum, el: any) => {
      d3.select(el.parentNode).classed("hover", true);

      const computedAxis = this.state.current.getComputed().axes.computed[this.axis] as AxisComputed;

      const focusPoint = {
        axis: this.axis,
        axisType: computedAxis.options.type,
        direction: this.direction(d),
        color: this.color(d),
        datum: this.axis[0] === "x" ? this.x(d) : this.y(d),
        formatter: computedAxis.formatter,
        label: this.label(d),
        description: this.description(d),
        x: attributes.x ? attributes.x(d) : attributes.x2,
        y: attributes.y ? attributes.y(d) : attributes.y2,
      };
      this.events.emit(Events.FOCUS.FLAG.HOVER, focusPoint);
    };
  }

  private onFlagLeave(_: Datum, el: any) {
    d3.select(el.parentNode).classed("hover", false);
    this.events.emit(Events.FOCUS.FLAG.OUT);
  }
}

export default Flag;
