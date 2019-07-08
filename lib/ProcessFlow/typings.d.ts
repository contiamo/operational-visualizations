import { Accessor, BaseConfig, ChartStateReadOnly, D3Selection, Facade, Focus } from "../shared/typings";
import Link from "./link";
import Nodes from "./node";
export { Accessor, Accessors, Canvas, D3Selection, Dimensions, EventEmitter, Focus, Position, ComputedWriter, WithConvert, } from "../shared/typings";
export declare type State = ChartStateReadOnly<InputData, ProcessFlowConfig, AccessorsObject, Computed>;
export interface ProcessFlowConfig extends BaseConfig {
    borderColor: string;
    focusElement: FocusElement;
    focusLabelPosition: string;
    highlightColor: string;
    horizontalNodeSpacing: number;
    labelOffset: number;
    linkBorderWidth: number;
    maxLinkWidth: number;
    maxNodeSize: number;
    minLinkWidth: number;
    minNodeSize: number;
    nodeBorderWidth: number;
    numberFormatter: (x: number) => string;
    showLinkFocusLabels: boolean;
    showNodeFocusLabels: boolean;
    verticalNodeSpacing: number;
}
export declare type TLink = Link;
export declare type TNode = Nodes;
export declare type Scale = (size: number) => number;
interface BaseFocusElement {
    type: "node" | "link" | "path" | "none";
    matchers?: Record<string, any>;
    hideLabel?: boolean;
}
export interface NodeFocusElement extends BaseFocusElement {
    type: "node";
    matchers: {
        id: string;
    };
}
export interface LinkFocusElement extends BaseFocusElement {
    type: "link";
    matchers: {
        sourceId: string;
        targetId: string;
    };
}
export interface PathFocusElement extends BaseFocusElement {
    type: "path";
    matchers: {
        path: string[];
    };
}
export interface NoFocusElement extends BaseFocusElement {
    type: "none";
}
export declare type FocusElement = NodeFocusElement | LinkFocusElement | PathFocusElement | NoFocusElement;
export interface Journey {
    size: number;
    path: string[];
}
export interface LinkAttrs {
    content?: Array<Record<string, any>>;
    dash?: string;
    focusLabel?: any;
    label?: string;
    size: number;
    source: TNode;
    sourceId: string;
    stroke?: string;
    target: TNode;
    targetId: string;
}
export interface NodeAttrs {
    color?: string;
    content?: Array<Record<string, any>>;
    shape?: string;
    size: number;
    stroke?: string;
    id?: string;
    label?: string;
    labelPosition?: string;
}
export interface DataAccessors {
    nodes: Accessor<any, any>;
    journeys: Accessor<any, any>;
}
export interface NodeAccessors {
    color: Accessor<NodeAttrs, string>;
    content: Accessor<NodeAttrs, Array<Record<string, any>>>;
    shape: Accessor<NodeAttrs, string>;
    size: Accessor<NodeAttrs, number>;
    stroke: Accessor<NodeAttrs, string>;
    id: Accessor<NodeAttrs, string>;
    label: Accessor<NodeAttrs, string>;
    labelPosition: Accessor<NodeAttrs, string>;
}
export interface LinkAccessors {
    content: (d: LinkAttrs) => Array<Record<string, any>>;
    dash: (d: LinkAttrs) => string;
    label: (d: LinkAttrs) => string;
    size: (d: LinkAttrs) => number;
    stroke: (d: LinkAttrs) => string;
    source: (d: LinkAttrs) => TNode | undefined;
    sourceId: (d: LinkAttrs) => string | undefined;
    target: (d: LinkAttrs) => TNode | undefined;
    targetId: (d: LinkAttrs) => string | undefined;
}
export interface AccessorsObject {
    data: DataAccessors;
    node: NodeAccessors;
    link: LinkAccessors;
}
export interface InputData {
    journeys?: Journey[];
    nodes?: any[];
}
export interface Data {
    journeys: Journey[];
    nodes: TNode[];
    links: TLink[];
}
export interface FocusPoint {
    offset: number;
    type: string;
    x: number;
    y: number;
    id: string;
}
export interface HoverPayload {
    d: TNode | TLink;
    focusPoint: FocusPoint;
    hideLabel?: boolean;
}
export declare type Facade = Facade<ProcessFlowConfig, InputData>;
export interface Components {
    focus: Focus;
}
export interface Renderer<TElement, TFocus> {
    draw: (data: TElement[]) => void;
    focusElement: (focusElement: TFocus) => void;
    highlight: (element: D3Selection, d: TElement, keepCurrent: boolean) => void;
}
interface ComputedCanvas {
    elRect: DOMRect;
    containerRect: DOMRect;
}
interface ComputedSeries {
    data: Data;
    horizontalNodeSpacing: number;
    width: number;
    height: number;
}
export interface Computed {
    canvas: ComputedCanvas;
    focus: {};
    series: ComputedSeries;
}
//# sourceMappingURL=typings.d.ts.map