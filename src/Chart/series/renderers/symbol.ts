import { compact, defaults, filter, get, map } from "lodash/fp";
import Events from "../../../shared/event_catalog";
import { withD3Element } from "../../../utils/d3_utils";
import Series from "../series";
import * as styles from "./styles";

import {
  symbol as d3Symbol,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
} from "d3-shape";

import {
  AxisOrientation,
  D3Selection,
  Datum,
  EventBus,
  RendererClass,
  RendererType,
  SingleRendererOptions,
  State,
  SymbolRendererAccessors,
} from "../../typings";

const defaultAccessors: SymbolRendererAccessors = {
  fill: () => "#fff",
  focusContent: () => [],
  size: () => 50,
  stroke: (series: Series) => series.legendColor(),
  symbol: () => "circle",
  opacity: () => 0.8,
};

const symbolOptions: { [key: string]: any } = {
  circle: {
    symbol: symbolCircle,
  },
  cross: {
    symbol: symbolCross,
  },
  diamond: {
    symbol: symbolDiamond,
  },
  square: {
    symbol: symbolSquare,
  },
  squareDiamond: {
    symbol: symbolSquare,
    rotation: 45,
  },
  star: {
    symbol: symbolStar,
  },
  triangle: {
    symbol: symbolTriangle,
  },
};

export type Options = SingleRendererOptions<SymbolRendererAccessors>;

class Symbol implements RendererClass<SymbolRendererAccessors> {
  private data!: Datum[];
  private el: D3Selection;
  private events: EventBus;
  public options!: Options;
  private series: Series;
  private state: any;
  public type: RendererType = "symbol";
  private xIsBaseline!: boolean;
  private xScale: any;
  private yScale: any;
  // Accessors
  private fill!: (d: Datum) => string;
  private focusContent!: (d: Datum) => Array<{ name: string; value: any }>;
  private opacity!: (d: Datum) => number;
  private size!: (d: Datum) => number;
  private stroke!: (d: Datum) => string;
  private symbol!: (d: Datum) => any;
  private x!: (d: Datum) => number | Date | string;
  private y!: (d: Datum) => number | Date | string;

  constructor(state: State, el: D3Selection, data: Datum[], options: Options, series: Series, events: EventBus) {
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
  }

  public draw() {
    this.setAxisScales();
    const data = filter((d: Datum) => this.validate(d))(this.data);
    const duration = this.state.current.getConfig().duration;

    const symbols = this.el.selectAll("path").data(data);

    symbols
      .enter()
      .append("svg:path")
      .attr("d", d =>
        d3Symbol()
          .type(this.symbol(d).symbol)
          .size(1)(),
      )
      .attr("transform", this.startTransform.bind(this))
      .merge(symbols)
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)))
      .on("mouseout", this.onMouseOut.bind(this))
      .on("click", withD3Element(this.onClick.bind(this)))
      .attr("fill", this.fill.bind(this))
      .attr("stroke", this.stroke.bind(this))
      .attr("opacity", this.opacity.bind(this))
      .transition()
      .duration(duration)
      .attr("d", d =>
        d3Symbol()
          .type(this.symbol(d).symbol)
          .size(this.size(d))(),
      )
      .attr("transform", this.transform.bind(this));

    symbols
      .exit()
      .transition()
      .duration(duration)
      .attr("d", d =>
        d3Symbol()
          .type(this.symbol(d).symbol)
          .size(1)(),
      )
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
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.symbol}`);
  }

  private validate(d: Datum): boolean {
    return isFinite(this.xScale(this.x(d))) && isFinite(this.yScale(this.y(d)));
  }

  private assignAccessors(customAccessors: Partial<SymbolRendererAccessors> = {}) {
    const accessors = defaults(defaultAccessors)(customAccessors);
    this.x = (d: Datum): any => this.series.x(d) || d.injectedX;
    this.y = (d: Datum): any => this.series.y(d) || d.injectedY;
    this.fill = (d: Datum) => accessors.fill(this.series, d);
    this.focusContent = (d: Datum) =>
      accessors.focusContent ? accessors.focusContent(this.series, d) : this.defaultFocusContent(d);
    this.stroke = (d: Datum) => accessors.stroke(this.series, d);
    this.symbol = (d: Datum) => symbolOptions[accessors.symbol(this.series, d)];
    this.size = (d: Datum) => accessors.size(this.series, d);
    this.opacity = (d: Datum) => accessors.opacity(this.series, d);
  }

  private defaultFocusContent(d: Datum): Array<{ name: string; value: any }> {
    const xTitle = this.state.current.getAccessors().data.axes(this.state.current.getData())[this.series.xAxis()].title;
    const yTitle = this.state.current.getAccessors().data.axes(this.state.current.getData())[this.series.yAxis()].title;
    return [
      {
        name: xTitle || "X",
        value: this.x(d),
      },
      {
        name: yTitle || "Y",
        value: this.y(d),
      },
    ];
  }

  private setAxisScales() {
    this.xIsBaseline = this.state.current.getComputed().axes.baseline === "x";
    const computedAxes = this.state.current.getComputed().axes.computed;
    this.xScale = computedAxes[this.series.xAxis()].scale;
    this.yScale = computedAxes[this.series.yAxis()].scale;
  }

  private transform(d: Datum): string {
    const x = this.xScale(d.x1 || this.x(d));
    const y = this.yScale(d.y1 || this.y(d));
    return `translate(${x}, ${y}) rotate(${this.symbol(d).rotation || 0})`;
  }

  private startTransform(d: Datum): string {
    const x = this.xScale(this.xIsBaseline ? d.x1 || this.x(d) : 0);
    const y = this.yScale(this.xIsBaseline ? 0 : d.y1 || this.y(d));
    return `translate(${x}, ${y})`;
  }

  private onMouseOver(d: Datum) {
    const focusPoint = {
      content: this.focusContent(d),
      position: "toRight",
      offset: this.series.symbolOffset(d),
      focus: {
        x: this.xScale(this.x(d)),
        y: this.yScale(this.y(d)),
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
}

export default Symbol;
