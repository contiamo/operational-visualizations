import { AxesData, AxisComputed, AxisOrientation, AxisPosition, BarSeries, Tick } from "../axis_utils/typings";
import { Accessor, BaseConfig, ChartStateReadOnly, Dimensions, Facade, Focus, Legend } from "../shared/typings";
import Series from "./series/series";

export * from "../axis_utils/typings";

export {
  Accessor,
  Accessors,
  Canvas,
  ComponentConfigInfo,
  ComponentHoverPayload,
  D3Selection,
  Dimensions,
  EventBus,
  Focus,
  Legend,
  Point,
  Position,
  StateWriter,
  WithConvert,
} from "../shared/typings";

export type State = ChartStateReadOnly<Data, ChartConfig, AccessorsObject, Computed>;

export interface FocusElement {
  type: "element" | "date";
  value: string | Date;
}

export interface ChartConfig extends BaseConfig {
  flagFocusOffset: number;
  focus?: FocusElement;
  focusDateOptions: string[];
  focusOffset: number;
  innerBarSpacing: number;
  innerBarSpacingCategorical: number;
  legend: boolean;
  maxBarWidthRatio: number;
  maxFocusLabelWidth: number;
  minBarWidth: number;
  noAxisMargin: number;
  numberFormatter: (x: number) => string;
  outerBarSpacing: number;
  palette: string[];
  showComponentFocus: boolean;
  timeAxisPriority: AxisPosition[];
}

export interface SeriesManager {
  assignData: () => void;
  draw: () => void;
}

// Renderers
export type RendererType = "area" | "bars" | "flag" | "line" | "symbol" | "text";

export type RendererAccessor<T> = (series: Series, d: Datum) => T;

export type LinearRendererAccessor<T> = (series: Series) => T;

export type InterpolationOption =
  | "cardinal"
  | "linear"
  | "monotoneX"
  | "monotoneY"
  | "step"
  | "stepAfter"
  | "stepBefore";

export interface LinearRendererAccessors {
  color: LinearRendererAccessor<string>;
  interpolate: LinearRendererAccessor<InterpolationOption>;
  closeGaps: LinearRendererAccessor<boolean>;
  opacity: LinearRendererAccessor<number>;
}

export type AreaRendererAccessors = LinearRendererAccessors;

export interface BarsRendererAccessors {
  barWidth: RendererAccessor<number | undefined>;
  color: RendererAccessor<string>;
  focusContent: RendererAccessor<any>;
  opacity: RendererAccessor<number>;
}

export interface FlagRendererAccessors {
  color: RendererAccessor<string>;
  description: RendererAccessor<string>;
  direction: RendererAccessor<"up" | "down">;
  label: RendererAccessor<string>;
  opacity: RendererAccessor<number>;
}

export interface FlagRendererConfig {
  axis: AxisPosition;
  axisOffset: number;
  axisPadding: number;
  flagHeight: number;
  flagWidth: number;
}

export interface LineRendererAccessors extends LinearRendererAccessors {
  dashed: LinearRendererAccessor<boolean>;
}

export type RangeRendererAccessors = LinearRendererAccessors;

export interface SymbolRendererAccessors {
  stroke: RendererAccessor<string>;
  fill: RendererAccessor<string>;
  focusContent: RendererAccessor<any>;
  symbol: RendererAccessor<any>;
  size: RendererAccessor<number>;
  opacity: RendererAccessor<number>;
}

export interface TextRendererAccessors {
  size: RendererAccessor<number>;
  opacity: RendererAccessor<number>;
}

export interface TextRendererConfig {
  offset: number;
  tilt: boolean;
}

export interface SingleRendererOptions<RendererAccessors> {
  type: RendererType;
  accessors?: Partial<RendererAccessors>;
  config?: { [key: string]: any };
}

export interface GroupedRendererOptions {
  type: "range" | "stacked";
  stackAxis?: AxisOrientation;
  renderAs: Array<SingleRendererOptions<any>>;
}

export type RendererOptions = SingleRendererOptions<any> | GroupedRendererOptions;

export interface RendererClass<RendererAccessors = any> {
  dataForAxis: (axis: AxisOrientation) => Array<string | number | Date>;
  draw: () => void;
  type: RendererType;
  update: (data: Datum[], options: SingleRendererOptions<RendererAccessors>) => void;
  close: () => void;
}

// Series
export interface Datum {
  x?: string | number | Date;
  x0?: number;
  x1?: number;
  y?: string | number | Date;
  y0?: number;
  y1?: number;
  injectedX?: string | number | Date;
  injectedY?: string | number | Date;
  [key: string]: any;
}

export type SeriesDatum = Record<string, any>;

export type SeriesData = SeriesDatum[];

export type SeriesAccessor<T> = Accessor<SeriesDatum, T>;

export interface SeriesAccessors {
  data: SeriesAccessor<Datum[]>;
  hide: SeriesAccessor<boolean>;
  hideInLegend: SeriesAccessor<boolean>;
  key: SeriesAccessor<string>;
  legendColor: SeriesAccessor<string>;
  legendName: SeriesAccessor<string>;
  renderAs: SeriesAccessor<RendererOptions[]>;
  axis: SeriesAccessor<AxisPosition>;
  xAxis: SeriesAccessor<"x1" | "x2">;
  yAxis: SeriesAccessor<"y1" | "y2">;
}

export interface AxisAttributes {
  dx: number | string;
  dy: number | string;
  text: any;
  x: any;
  y: any;
  transform?: ((d: Tick) => string) | string;
}

// Data
export interface Data {
  series?: SeriesData;
  axes?: AxesData;
}

export interface DataAccessors {
  series: Accessor<Data, SeriesData>;
  axes: Accessor<Data, AxesData>;
}

export interface AccessorsObject {
  data: DataAccessors;
  series: SeriesAccessors;
}

// Legend
export type LegendPosition = "top" | "bottom";

export type LegendFloat = "left" | "right";

export interface LegendDatum {
  label: string;
  color: string;
  key: string;
}

export interface DataForLegends {
  top: {
    left: LegendDatum[];
    right: LegendDatum[];
  };
  bottom: {
    left: LegendDatum[];
  };
}

export interface HoverPayload {
  position: string;
  content: Array<{ name: string; value: any }>;
  offset: number;
  focus: {
    x: number;
    y: number;
  };
}

export interface DateToFocus {
  date: Date;
  axis: AxisPosition;
}

export interface DatesToFocus {
  main: DateToFocus;
  comparison?: DateToFocus;
}

export interface FocusValue {
  value: Date | number | string;
  valuePosition: number;
}

// @TODO
export interface Components {
  axes: any;
  focus: Focus;
  legends: Legend;
}

export type ClipPath = "drawing_clip" | "yrules_clip" | "xyrules_clip";

export type SeriesElements = Array<[RendererType, ClipPath]>;

export type Facade = Facade<ChartConfig, Data>;

export interface MousePosition {
  x: number;
  y: number;
}

// All values saved in the state
interface ComputedAxes {
  barPositions: {
    width: (seriesId: string) => number;
    offset: (seriesId: string) => number;
  };
  baseline: AxisOrientation;
  computed: Partial<Record<AxisPosition, AxisComputed>>;
  margins: Record<AxisPosition, number>;
  previous: Partial<Record<AxisPosition, AxisComputed>>;
  priorityTimeAxis: AxisPosition;
  requiredAxes: AxisPosition[];
}

// All computed once Canvas.draw() has been called
interface ComputedCanvas {
  drawingContainerDims: Dimensions;
  drawingDims: Dimensions;
  containerRect: DOMRect;
}

export type FocusDatum = FocusValue & {
  axisPriority: "main" | "comparison";
  color: string;
  label: string;
  displayPoint: boolean;
  stack?: number;
};

// All computed once SeriesManager.assignData() has been called
interface ComputedSeries {
  dataForLegends: DataForLegends;
  dataForAxes: Partial<Record<AxisPosition, Array<string | number | Date>>>;
  barSeries: Record<string, BarSeries>;
  axesWithFlags: Record<string, any>;
  dataForFocus: (focusDates: DatesToFocus) => FocusDatum[];
}

export interface Computed {
  axes: ComputedAxes;
  canvas: ComputedCanvas;
  series: ComputedSeries;
}
