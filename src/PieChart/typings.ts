// Type definitions for the Contiamo Process Flow visualization
import { Arc, Pie, PieArcDatum } from "d3-shape";

import {
  Accessor,
  BaseConfig,
  ChartStateReadOnly,
  D3Selection,
  Dimensions,
  Facade,
  Focus,
  Legend,
} from "../shared/typings";

export {
  Accessor,
  Accessors,
  Canvas,
  ComponentConfigInfo,
  ComponentHoverPayload,
  D3Selection,
  Dimensions,
  EventEmitter,
  Focus,
  Legend,
  Point,
  Position,
  ComputedWriter,
  WithConvert,
} from "../shared/typings";

export type State = ChartStateReadOnly<Data, PieChartConfig, AccessorsObject, Computed>;

export type FocusElement = string;

export interface PieChartConfig extends BaseConfig {
  displayPercentages: boolean;
  focusElement?: FocusElement;
  focusOffset: number;
  legend: true;
  maxWidth: number;
  maxTotalFontSize: number;
  minWidth: number;
  minInnerRadius: number;
  minTotalFontSize: number;
  outerBorderMargin: number;
  palette: string[];
  showComponentFocus: boolean;
}

export interface Datum {
  value: number;
  key: string;
  percentage: number;
  unfilled: boolean;
}

export interface InputDatum {
  value?: number;
  key?: string;
  percentage?: number;
  unfilled?: boolean;
}

export type InputData = InputDatum[];

export interface Data {
  data: InputDatum[];
  renderAs: RendererOptions[];
}

export interface LegendDatum {
  label: string;
  color?: string;
  comparison?: boolean;
}

export interface DataAccessors {
  data: Accessor<Data, InputData>;
}

export interface SeriesAccessors {
  name: Accessor<InputDatum, string>;
  renderAs: Accessor<InputDatum, any>;
}

export interface AccessorsObject {
  data: DataAccessors;
  series: SeriesAccessors;
}

export type RendererAccessor<T> = Accessor<InputDatum | ComputedDatum, T>;

export interface RendererAccessors {
  key: RendererAccessor<string>;
  value: RendererAccessor<number>;
  color: RendererAccessor<string>;
}

export interface DatumInfo {
  key: string;
  value: number;
  percentage: number;
}

export interface HoverPayload {
  focusPoint: { centroid: [number, number] };
  d: DatumInfo;
}

export interface Components {
  focus: Focus;
  legend: Legend;
}

export type Facade = Facade<PieChartConfig, Data>;

export interface RendererOptions {
  type: RendererType;
  accessors?: { [key: string]: Accessor<Datum, any> };
  extent?: "semi" | "full";
  comparison?: InputDatum;
  target?: number;
}

export type ComputedDatum = PieArcDatum<Datum>;

export interface ComputedInitial {
  layout: Pie<any, any>;
  total: number;
  data: ComputedDatum[];
  target?: number;
}

export interface ComputedArcs {
  arc: Arc<any, any>;
  arcOver: Arc<any, any>;
  rInner: any;
  rInnerHover: any;
  r: any;
  rHover: any;
}

export interface ComputedData extends ComputedInitial, ComputedArcs {
  comparison?: Datum;
}

export type RendererType = "donut" | "polar" | "gauge";

export interface Renderer {
  dataForLegend: () => LegendDatum[];
  draw: () => void;
  key: Accessor<InputDatum | Datum | ComputedDatum, string>;
  remove: () => void;
  setData: (data: InputData) => void;
  state: ChartStateReadOnly<Data, PieChartConfig, AccessorsObject, Computed>;
  type: RendererType;
  updateOptions: (options: { [key: string]: any }) => void;
  value: Accessor<InputDatum | Datum | ComputedDatum, number>;
}

// Computed values saved in state
interface ComputedCanvas {
  containerRect: DOMRect;
  drawingContainerDims: Dimensions;
  drawingContainerRect: DOMRect;
  elements: Record<string, D3Selection>;
  legend: D3Selection;
}

interface ComputedSeries {
  data: InputData;
  dataForLegend: LegendDatum[];
}

export interface Computed {
  canvas: ComputedCanvas;
  focus: {};
  legend: {};
  series: ComputedSeries;
}
