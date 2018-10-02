// Type definitions for the Contiamo Sunburst visualization
import Breadcrumb from "./breadcrumb"
import Renderer from "./renderer"
import RootLabel from "./root_label"
import { HierarchyRectangularNode } from "d3-hierarchy"
import { Accessor, BaseConfig, Focus, Facade, ChartStateReadOnly } from "../shared/typings"

export {
  Accessor,
  Accessors,
  Canvas,
  D3Selection,
  Dimensions,
  EventBus,
  Point,
  Position,
  StateWriter,
} from "../shared/typings"

export type State = ChartStateReadOnly<RawData, SunburstConfig, AccessorsObject, Computed>

export interface SunburstConfig extends BaseConfig {
  arrowOffset: number
  breadcrumbItemWidth: number
  centerCircleRadius: number
  disableAnimations: boolean
  focusOffset: number
  maxBreadcrumbLength: number
  maxRings: number
  maxTotalFontSize: number
  minTotalFontSize: number
  numberFormatter: (x: number) => string
  outerBorderMargin: number
  palette: string[]
  propagateColors: boolean
  sort: boolean
  zoomNode?: { [key: string]: any }
}

export interface RawData {
  empty?: boolean
  id?: string
  name?: string
  value?: number
  children?: RawData[]
  [key: string]: any
}

export interface Datum extends HierarchyRectangularNode<RawData> {
  id?: string
  value?: number
  color?: string
  name?: string
  zoomable?: boolean
  hops?: boolean
}

export interface DataAccessors {
  data: Accessor<any, RawData>
}

export interface SeriesAccessors {
  color: Accessor<Datum, string>
  id: Accessor<Datum, string>
  name: Accessor<Datum, string>
  value: Accessor<Datum, number>
}

export interface AccessorsObject {
  data: DataAccessors
  series: SeriesAccessors
}

export interface Computed {
  canvas?: { [key: string]: any }
  focus?: { [key: string]: any }
  renderer?: { [key: string]: any }
}

export interface FocusPoint {
  centroid: [number, number]
  labelPosition: string
}

export interface HoverPayload {
  d: Datum
  hideLabel: boolean
  focusPoint: FocusPoint
}

export interface ClickPayload {
  d?: Datum
  force?: boolean
}

export type Focus = Focus<HoverPayload>

export type Facade = Facade<SunburstConfig, RawData>

export interface Components {
  breadcrumb: Breadcrumb
  focus: Focus<HoverPayload>
  renderer: Renderer
  rootLabel: RootLabel
}
