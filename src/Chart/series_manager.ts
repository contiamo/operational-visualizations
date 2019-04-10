import { stack as d3Stack } from "d3-shape";
import { AxisPosition } from "../axis_utils/typings";
import ChartSeries, { ChartSeriesOptions } from "./series/chart_series";

import {
  cloneDeep,
  filter,
  find,
  flow,
  forEach,
  get,
  includes,
  indexOf,
  invoke,
  LodashForEach,
  LodashMapKeys,
  map,
  mapKeys,
  merge,
  reduce,
  remove,
  set,
  uniqBy,
} from "lodash/fp";

import {
  AxisOrientation,
  BarSeriesInfo,
  ComputedWriter,
  D3Selection,
  DataForLegends,
  DatesToFocus,
  DateToFocus,
  Datum,
  EventEmitter,
  GroupedRendererOptions,
  LegendFloat,
  LegendPosition,
  RendererOptions,
  SeriesAccessor,
  SeriesData,
  SeriesDatum,
  SeriesManager,
  State,
  WithConvert,
} from "./typings";

type GroupedRendererType = "stacked" | "range";

type GroupCalculation = (group: { [key: string]: any }, index: number) => void;

class ChartSeriesManager implements SeriesManager {
  private el: D3Selection;
  private events: EventEmitter;
  private key!: SeriesAccessor<string>;
  private oldSeries: ChartSeries[] = [];
  private renderAs!: SeriesAccessor<RendererOptions[]>;
  private series: ChartSeries[] = [];
  private state: State;
  private computedWriter: ComputedWriter;

  constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.computedWriter = computedWriter;
    this.events = events;
    this.el = el;
  }

  // Helpers
  private isNotHidden(series: { [key: string]: any }) {
    return !this.state.current.getAccessors().series.hide(series);
  }

  private findBarsRenderer(series: ChartSeries) {
    return find({ type: "bars" })(series.renderers);
  }

  public assignData() {
    const accessors = this.state.current.getAccessors().series;
    this.key = accessors.key;
    this.renderAs = accessors.renderAs;
    this.prepareData();
    this.computedWriter("dataForLegends", this.dataForLegends());
    this.computedWriter("dataForAxes", this.dataForAxes());
    this.computedWriter("barSeries", this.computeBarSeries());
    this.computedWriter("axesWithFlags", this.axesWithFlags());
    this.computedWriter("dataForFocus", this.dataForFocus.bind(this));
  }

  /**
   * Prepare the data for rendering.
   * - Remove hidden series from the data
   * - Assign bar indices to enable correct placement on the axis
   * - Transform grouped series into individual series which can be rendered independently
   */
  private prepareData() {
    const data = flow(
      filter((d: SeriesDatum) => this.isNotHidden(d)),
      this.handleGroupedSeries("stacked", this.computeStack.bind(this)),
      this.handleGroupedSeries("range", this.computeRange.bind(this)),
    )(this.state.current.getAccessors().data.series(this.state.current.getData()));

    this.removeAllExcept(map(this.key)(data));
    forEach(this.updateOrCreate.bind(this))(data);
  }

  private updateOrCreate(options: ChartSeriesOptions) {
    const series = this.get(this.key(options));
    series ? series.update(options) : this.create(options);
  }

  /**
   * Assign bar index to each series
   * Grouped series will have the same bar index, while individual series will have unique indices
   * The bar indices are used to determine where bars are rendered respective to each tick.
   */
  private computeBarSeries(): BarSeriesInfo {
    const barSeries: BarSeriesInfo = {};
    let index = 0;
    this.series.filter(this.findBarsRenderer).forEach(series => {
      barSeries[series.key()] = {
        index,
        stackIndex: series.options.stackIndex,
        barWidth: (this.findBarsRenderer(series) as any).barWidth(series), // @TODO
      };
      if (!series.options.stackIndex) {
        index = index + 1;
      }
    });
    return barSeries;
  }

  /**
   * There are 2 types of grouped series: ranges and stacks.
   * This method does the following:
   * - identifies the grouped series
   * - applies the appropriate calculations (provided as the `compute` argument) to each group of series
   * - returns each series of the group as as individual series object with its own rendering options,
   * so it can be rendered independently from the other series in the group.
   */
  private handleGroupedSeries(type: GroupedRendererType, compute: GroupCalculation) {
    return (data: SeriesData) => {
      const newData: SeriesData = [];
      let groupIndex = 0;
      forEach((series: SeriesDatum) => {
        const rendererTypes = map((options: RendererOptions) => options.type)(this.renderAs(series));
        if (rendererTypes.includes(type)) {
          const computedSeries = cloneDeep(series);
          // Perform group calculation
          compute(computedSeries, groupIndex);
          // Append each series in the group individually to the new data array
          forEach((options: any) => {
            options.renderAs = this.renderAs(this.renderAs(computedSeries)[0]);
            newData.push(options);
          })(computedSeries.series);
          // Add one to the group index
          groupIndex = groupIndex + 1;
        } else {
          newData.push(series);
        }
      })(data);

      return newData;
    };
  }

  // Add clip data and stack index to grouped range series
  private computeRange(range: { [key: string]: any }, index: number) {
    if (range.series.length !== 2) {
      throw new Error("Range renderer must have exactly 2 series.");
    }

    // Each series is assigned the data from the other series to be used for defining clip paths.
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((series: { [key: string]: any }, i: number) => {
      series.clipData = range.series[1 - i].data;
      series.stackIndex = `range${index + 1}`;
    })(range.series);
  }

  // Compute stack values and add stack index to grouped stack series
  private computeStack(stack: { [key: string]: any }, index: number) {
    // By default, stacks are vertical
    const stackAxis: AxisOrientation = (this.renderAs(stack)[0] as GroupedRendererOptions).stackAxis || "y";
    const baseAxis: AxisOrientation = stackAxis === "y" ? "x" : "y";
    const baseValue = (series: any) => (series.datumAccessors && series.datumAccessors[baseAxis]) || get(baseAxis);

    // Transform data into suitable structure for d3 stack
    const dataToStack = reduce((memo: any[], series: any) => {
      forEach((d: any) => {
        const datum = (mapKeys as WithConvert<LodashMapKeys>).convert({ cap: false })((val: any, _: string) =>
          val === baseValue(series)(d) ? baseAxis : this.key(series),
        )(d);
        const existingDatum = find({ [baseAxis]: baseValue(series)(d) })(memo);
        existingDatum ? (memo[indexOf(existingDatum)(memo)] = merge(datum)(existingDatum)) : memo.push(datum);
      })(series.data);
      return memo;
    }, [])(stack.series);

    // Stack data
    const stackedData = d3Stack()
      .value((d, key) => d[key] || 0)
      .keys(map(this.key)(stack.series))(dataToStack);

    // Return to required series data structure
    forEach((series: any) => {
      const originalSeries = find({ key: series.key })(stack.series) as SeriesDatum;
      originalSeries.data = map(
        (datum: any): Datum => {
          return {
            [baseAxis]: datum.data[baseAxis],
            [stackAxis]: datum.data[series.key],
            [`${stackAxis}${0}`]: datum[0],
            [`${stackAxis}${1}`]: datum[1],
          };
        },
      )(series);
      originalSeries.stacked = true;
      originalSeries.stackIndex = index + 1;
      delete originalSeries.datumAccessors;
    })(stackedData);
  }

  private get(key: string) {
    return find((series: ChartSeries) => this.key(series.options) === key)(this.series);
  }

  private remove(key: string) {
    const series = this.get(key);
    if (!series) {
      return;
    }
    this.oldSeries.push(series);
    remove((s: ChartSeries) => this.key(s.options) === key)(this.series);
  }

  private removeAllExcept(keys: string[]) {
    flow(
      filter((series: ChartSeries): boolean => !includes(this.key(series.options))(keys)),
      map((series: ChartSeries): string => this.key(series.options)),
      forEach(this.remove.bind(this)),
    )(this.series);
  }

  private dataForLegends() {
    return reduce((memo: Partial<DataForLegends>, series: ChartSeries) => {
      if (series.hideInLegend()) {
        return memo;
      }
      const position: LegendPosition = series.legendPosition();
      const float: LegendFloat = series.legendFloat();
      return set([position, float])((get([position, float])(memo) || []).concat(series.dataForLegend()))(memo);
    }, {})(this.series);
  }

  private dataForAxes() {
    return reduce((memo: Partial<Record<AxisPosition, any>>, series: ChartSeries) => {
      const xAxis = series.xAxis();
      const yAxis = series.yAxis();
      memo[xAxis] = uniqBy(String)((memo[xAxis] || []).concat(series.dataForAxis("x")));
      memo[yAxis] = uniqBy(String)((memo[yAxis] || []).concat(series.dataForAxis("y")));
      return memo;
    }, {})(this.series);
  }

  private axesWithFlags() {
    return reduce((axes: Record<string, any>, series: ChartSeries) => {
      if (series.hasFlags()) {
        const flag: any = series.get("flag");
        axes[flag.axis] = axes[flag.axis] || { axisPadding: 0 };
        axes[flag.axis].axisPadding = Math.max(axes[flag.axis].axisPadding, flag.axisPadding);
      }
      return axes;
    }, {})(this.series);
  }

  private dataForFocus(focusDates: DatesToFocus) {
    const seriesWithoutFlags = filter((series: ChartSeries) => !series.get("flag"))(this.series);

    return map(
      (series: ChartSeries): { [key: string]: any } => {
        const isMainAxis: boolean = includes(focusDates.main.axis)([series.xAxis(), series.yAxis()]);
        const axisPriority: keyof DatesToFocus = isMainAxis ? "main" : "comparison";
        const focusDate = focusDates[axisPriority] as DateToFocus;

        return {
          ...series.valueAtFocus(focusDate),
          axisPriority,
          color: series.legendColor(),
          label: series.legendName(),
          displayPoint: series.displayFocusPoint(),
          stack: !series.options.clipData ? series.options.stackIndex : undefined,
        };
      },
    )(seriesWithoutFlags);
  }

  private create(options: ChartSeriesOptions) {
    this.series.push(new ChartSeries(this.state, this.events, this.el, options));
  }

  public draw() {
    forEach(invoke("close"))(this.oldSeries);
    this.oldSeries = [];
    forEach(invoke("draw"))(this.series);
  }
}

export default ChartSeriesManager;
