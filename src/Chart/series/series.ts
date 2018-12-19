import Renderer from "./renderer";

import {
  compact,
  filter,
  find,
  flatten,
  flow,
  forEach,
  get,
  includes,
  invoke,
  isNil,
  LodashForEach,
  map,
  uniqBy,
} from "lodash/fp";

import {
  AxisOrientation,
  D3Selection,
  DateToFocus,
  Datum,
  EventBus,
  LegendDatum,
  LegendFloat,
  LegendPosition,
  RendererClass,
  RendererType,
  SeriesAccessor,
  SingleRendererOptions,
  State,
  WithConvert,
} from "../typings";

const hasValue = (d: any): boolean => {
  return !!d || d === 0;
};

const defaultDatumAccessors = {
  x: (d: Datum) => d.x,
  y: (d: Datum) => d.y,
};

class ChartSeries {
  private el: D3Selection;
  private events: EventBus;
  private oldRenderers!: RendererClass[];
  public options!: { [key: string]: any };
  public renderers: RendererClass[] = [];
  private state: any;
  // Accessors
  private data!: () => Datum[] | Array<{ [key: string]: any }>;
  public hide!: () => boolean;
  public hideInLegend!: () => boolean;
  public key!: () => string;
  public legendColor!: () => string;
  public legendName!: () => string;
  public renderAs!: () => Array<SingleRendererOptions<any>>;
  public symbolOffset!: (d: Datum) => number;
  public xAxis!: () => "x1" | "x2";
  public yAxis!: () => "y1" | "y2";
  public x!: (d: Datum) => number | string | Date;
  public y!: (d: Datum) => number | string | Date;

  constructor(state: State, events: EventBus, el: D3Selection, options: any) {
    this.state = state;
    this.events = events;
    this.el = el;
    this.update(options);
  }

  public update(options: any) {
    this.assignAccessors(options.datumAccessors);
    this.options = options;
    this.updateRenderers();
  }

  public assignAccessors(datumAccessors: any) {
    // Assign series accessors
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((accessor: SeriesAccessor<any>, key: string) => {
      (this as any)[key] = () => accessor(this.options);
    })(this.state.current.getAccessors().series);
    // Assign series-specific datum accessors
    this.x = (datumAccessors && datumAccessors.x) || defaultDatumAccessors.x;
    this.y = (datumAccessors && datumAccessors.y) || defaultDatumAccessors.y;
  }

  private updateRenderers() {
    this.oldRenderers = [];
    const rendererTypes = map(get("type"))(this.renderAs());
    this.removeAllExcept(rendererTypes);
    forEach((options: SingleRendererOptions<any>) => {
      const renderer = this.get(options.type);
      renderer ? renderer.update(this.options.data, options) : this.addRenderer(options);
      if (options.type === "symbol") {
        this.symbolOffset = (d: Datum) => Math.ceil(Math.sqrt(((renderer || this.get(options.type)) as any).size(d)));
      }
    })(this.renderAs());
  }

  private removeAllExcept(types: RendererType[]) {
    flow(
      filter((renderer: RendererClass): boolean => !includes(renderer.type)(types)),
      forEach(this.remove.bind(this)),
    )(this.renderers);
  }

  public get(type: string) {
    return find((renderer: RendererClass) => renderer.type === type)(this.renderers);
  }

  private addRenderer(options: SingleRendererOptions<any>) {
    this.renderers.push(new Renderer(
      this.state,
      this.events,
      this.el,
      this.options.data,
      options,
      this,
    ) as RendererClass);
  }

  private remove(renderer: RendererClass) {
    this.oldRenderers.push(renderer);
    renderer.close();
    this.renderers = filter((r: RendererClass) => r !== renderer)(this.renderers);
  }

  public dataForLegend(): LegendDatum {
    return {
      color: this.legendColor(),
      label: this.legendName(),
      key: this.key(),
    };
  }

  public dataForAxis(axis: AxisOrientation) {
    const data = map((renderer: RendererClass) => renderer.dataForAxis(axis))(this.renderers);
    return uniqBy(String)(compact(flatten(data)));
  }

  public legendPosition(): LegendPosition {
    return this.xAxis() === "x1" ? "top" : "bottom";
  }

  public legendFloat(): LegendFloat {
    return this.legendPosition() === "top" && this.yAxis() === "y2" ? "right" : "left";
  }

  public displayFocusPoint(): boolean {
    return (
      filter(
        (renderer: RendererClass): boolean => {
          return renderer.type === "area" || renderer.type === "line";
        },
      )(this.renderers).length > 0
    );
  }

  public hasFlags(): boolean {
    return !!this.get("flag");
  }

  public hasData(): boolean {
    return !!this.data() && this.data().length > 0;
  }

  public valueAtFocus(focus: DateToFocus): any {
    const xIsBaseline = this.state.current.getComputed().axes.baseline === "x";
    const baselineAccessor = (d: Datum) =>
      xIsBaseline ? this.x(d) || d.injectedX || 0 : this.y(d) || d.injectedY || 0;
    const valueAccessor = xIsBaseline ? this.y : this.x;
    const positionAccessor = (d: Datum) =>
      xIsBaseline ? (hasValue(d.y1) ? d.y1 : this.y(d)) : hasValue(d.x1) ? d.x1 : this.x(d);
    const valueScale = this.state.current.getComputed().axes.computed[xIsBaseline ? this.yAxis() : this.xAxis()].scale;
    const datum = find(
      (d: Datum): boolean => {
        return baselineAccessor(d).toString() === focus.date.toString();
      },
    )(this.data());

    return {
      value: !datum || isNil(valueAccessor(datum)) ? "-" : valueAccessor(datum),
      valuePosition: !datum || isNil(valueAccessor(datum)) ? undefined : valueScale(positionAccessor(datum)),
    };
  }

  public draw() {
    forEach(invoke("draw"))(this.renderers);
  }
}

export default ChartSeries;
