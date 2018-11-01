import { Accessor, BaseConfig, Facade, Focus, Legend, ChartStateReadOnly } from "../shared/typings"
import { AxisPosition, AxisOptions, AxisOrientation } from "../axis_utils/typings"

export * from "../axis_utils/typings"

export {
  Accessor,
  Accessors,
  ComponentConfigInfo,
  ComponentHoverPayload,
  Dimensions,
  EventBus,
  Legend,
  Point,
  Position,
  D3Selection,
  StateWriter,
  Canvas,
} from "../shared/typings"

export type State = ChartStateReadOnly<Data, ChartConfig, AccessorsObject, Computed>

export type FocusElement = { type: "element" | "date"; value: string | Date }

export interface ChartConfig extends BaseConfig {
  flagFocusOffset: number
  focus?: FocusElement
  focusDateOptions: string[]
  focusOffset: number
  innerBarSpacing: number
  innerBarSpacingCategorical: number
  legend: boolean
  maxBarWidthRatio: number
  maxFocusLabelWidth: number
  minBarWidth: number
  numberFormatter: (x: number) => string
  outerBarSpacing: number
  palette: string[]
  showComponentFocus: boolean
  timeAxisPriority: string[]
}

export interface SeriesManager {
  assignData: () => void
  draw: () => void
}

// Renderers
export type RendererType = "area" | "bars" | "flag" | "line" | "symbol" | "text"

export type RendererAccessor<T> = (series?: any, d?: Datum) => T

export type InterpolationOption =
  | "cardinal"
  | "linear"
  | "monotoneX"
  | "monotoneY"
  | "step"
  | "stepAfter"
  | "stepBefore"

export interface LinearRendererAccessors {
  color: RendererAccessor<string>
  interpolate: RendererAccessor<InterpolationOption>
  closeGaps: RendererAccessor<boolean>
  opacity: RendererAccessor<number>
}

export type AreaRendererAccessors = LinearRendererAccessors

export interface BarsRendererAccessors {
  barWidth: RendererAccessor<number>
  color: RendererAccessor<string>
  focusContent: RendererAccessor<any>
  opacity: RendererAccessor<number>
}

export interface FlagRendererAccessors {
  color: RendererAccessor<string>
  description: RendererAccessor<string>
  direction: RendererAccessor<"up" | "down">
  label: RendererAccessor<string>
  opacity: RendererAccessor<number>
}

export interface FlagRendererConfig {
  axis: AxisPosition
  axisOffset: number
  axisPadding: number
  flagHeight: number
  flagWidth: number
}

export interface LineRendererAccessors extends LinearRendererAccessors {
  dashed: RendererAccessor<boolean>
}

export type RangeRendererAccessors = LinearRendererAccessors

export interface SymbolRendererAccessors {
  stroke: RendererAccessor<string>
  fill: RendererAccessor<string>
  focusContent: RendererAccessor<any>
  symbol: RendererAccessor<any>
  size: RendererAccessor<number>
  opacity: RendererAccessor<number>
}

export interface TextRendererAccessors {
  size: RendererAccessor<number>
  opacity: RendererAccessor<number>
}

export interface TextRendererConfig {
  offset: number
  tilt: boolean
}

export interface SingleRendererOptions<RendererAccessors> {
  type: RendererType
  accessors?: Partial<RendererAccessors>
  config?: { [key: string]: any }
}

export interface GroupedRendererOptions {
  type: "range" | "stacked"
  stackAxis?: AxisOrientation
  renderAs: SingleRendererOptions<any>[]
}

export type RendererOptions = SingleRendererOptions<any> | GroupedRendererOptions

export interface RendererClass<RendererAccessors> {
  dataForAxis: (axis: AxisOrientation) => any[]
  draw: () => void
  type: RendererType
  update: (data: Datum[], options: SingleRendererOptions<RendererAccessors>) => void
  close: () => void
}

// Series
export interface Datum {
  x?: string | number | Date
  x0?: number
  x1?: number
  y?: string | number | Date
  y0?: number
  y1?: number
  injectedX?: string | number | Date
  injectedY?: string | number | Date
  [key: string]: any
}

export type SeriesData = { [key: string]: any }[]

export type SeriesAccessor<T> = Accessor<{ [key: string]: any }, T>

export interface SeriesAccessors {
  data: SeriesAccessor<Datum[] | { [key: string]: any }[]>
  hide: SeriesAccessor<boolean>
  hideInLegend: SeriesAccessor<boolean>
  key: SeriesAccessor<string>
  legendColor: SeriesAccessor<string>
  legendName: SeriesAccessor<string>
  renderAs: SeriesAccessor<RendererOptions[]>
  axis: SeriesAccessor<AxisPosition>
  xAxis: SeriesAccessor<"x1" | "x2">
  yAxis: SeriesAccessor<"y1" | "y2">
}

// Axes
export interface AxesData {
  [key: string]: Partial<AxisOptions>
}

export interface AxisAttributes {
  dx: number | string
  dy: number | string
  text: any
  x: any
  y: any
}

// Data
export interface Data {
  series?: SeriesData
  axes?: AxesData
}

export interface DataAccessors {
  series: Accessor<Data, SeriesData>
  axes: Accessor<Data, AxesData>
}

export interface AccessorsObject {
  data: DataAccessors
  series: SeriesAccessors
}

// State
export interface Computed {
  axes?: { [key: string]: any }
  canvas?: { [key: string]: any }
  series?: { [key: string]: any }
}

// Legend
export type LegendPosition = "top" | "bottom"

export type LegendFloat = "left" | "right"

export interface LegendDatum {
  label: string
  color: string
  key: string
}

export interface DataForLegends {
  top: {
    left: LegendDatum[]
    right: LegendDatum[]
  }
  bottom: {
    left: LegendDatum[]
  }
}

export interface HoverPayload {
  position: string
  content: { name: string; value: any }[]
  offset: number
  focus: {
    x: number
    y: number
  }
}

export type Focus = Focus<HoverPayload>

// @TODO
export interface Components {
  axes: any
  // focus: Focus<HoverPayload>
  legends: Legend
}

export type ClipPath = "drawing_clip" | "yrules_clip" | "xyrules_clip"

export type SeriesElements = [RendererType, ClipPath][]

export type Facade = Facade<ChartConfig, Data>

export interface MousePosition {
  x: number
  y: number
}
