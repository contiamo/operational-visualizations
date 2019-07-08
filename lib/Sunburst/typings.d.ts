import { HierarchyRectangularNode } from "d3-hierarchy";
import { Accessor, BaseConfig, ChartStateReadOnly, Dimensions, Facade, Focus } from "../shared/typings";
import Breadcrumb from "./breadcrumb";
import Renderer from "./renderer";
import RootLabel from "./root_label";
export { Accessor, Accessors, Canvas, D3Selection, Dimensions, EventEmitter, Point, Position, ComputedWriter, WithConvert, } from "../shared/typings";
export declare type State = ChartStateReadOnly<Data, SunburstConfig, AccessorsObject, Computed>;
export interface SunburstConfig extends BaseConfig {
    arrowOffset: number;
    breadcrumbItemWidth: number;
    centerCircleRadius: number;
    disableAnimations: boolean;
    focusOffset: number;
    maxBreadcrumbLength: number;
    maxRings: number;
    maxTotalFontSize: number;
    minTotalFontSize: number;
    numberFormatter: (x: number) => string;
    outerBorderMargin: number;
    palette: string[];
    propagateColors: boolean;
    sort: boolean;
    zoomNode?: Partial<Record<keyof ProcessedData, any>>;
}
export interface Data {
    empty?: boolean;
    id?: string;
    name?: string;
    value?: number;
    children?: Data[];
    [key: string]: any;
}
export interface ProcessedData {
    empty?: boolean;
    color: string;
    name: string;
    id: string;
    zoomable: boolean;
    value: number;
    hops?: boolean;
}
export declare type HierarchyDatum = HierarchyRectangularNode<ProcessedData>;
export interface DataAccessors {
    data: Accessor<any, Data>;
}
export interface SeriesAccessors {
    color: Accessor<Data, string>;
    id: Accessor<Data, string>;
    name: Accessor<Data, string>;
    value: Accessor<Data, number>;
}
export interface AccessorsObject {
    data: DataAccessors;
    series: SeriesAccessors;
}
export interface FocusPoint {
    centroid: [number, number];
    labelPosition: string;
}
export interface HoverPayload {
    d: HierarchyDatum;
    hideLabel: boolean;
    focusPoint: FocusPoint;
}
export interface ClickPayload {
    d?: HierarchyDatum;
    force?: boolean;
}
export declare type Focus = Focus;
export declare type Facade = Facade<SunburstConfig, Data>;
export interface Components {
    breadcrumb: Breadcrumb;
    focus: Focus;
    renderer: Renderer;
    rootLabel: RootLabel;
}
interface ComputedCanvas {
    drawingDims: Dimensions;
    containerRect: DOMRect;
}
interface ComputedRenderer {
    innerRadius: number;
    zoomNode?: HierarchyDatum;
    topNode?: HierarchyDatum;
    data: HierarchyDatum[];
}
export interface Computed {
    canvas: ComputedCanvas;
    breadcrumb: {};
    focus: {};
    renderer: ComputedRenderer;
    rootLabel: {};
}
//# sourceMappingURL=typings.d.ts.map