import { Pie, PieArcDatum } from "d3-shape";
import { Accessor, ComputedArcs, ComputedData, Datum, Dimensions, InputDatum, Renderer, RendererAccessors } from "../typings";
export declare const assignOptions: (ctx: Renderer, options: Record<string, any>) => void;
export declare const defaultAccessors: (ctx: Renderer) => RendererAccessors;
export declare const assignAccessors: (ctx: Renderer, customAccessors: Partial<RendererAccessors>) => void;
export declare const computeTranslate: (drawingDims: Dimensions, yOffset?: number) => [number, number];
export declare const translateBack: (point: [number, number], currentTranslation: [number, number]) => [number, number];
export declare const textAttributes: (computed: ComputedArcs) => {
    transform: (d: Datum) => string;
    text: (d: PieArcDatum<Datum>) => string | null;
    textAnchor: string;
};
export declare const percentageString: (d: PieArcDatum<Datum>) => string | null;
export declare const translateString: (values: [number, number]) => string;
export declare const createArcGroups: (el: import("d3-selection").Selection<any, any, any, any>, data: PieArcDatum<Datum>[], key: Accessor<InputDatum | PieArcDatum<Datum>, string>) => import("d3-selection").Selection<import("d3-selection").BaseType, PieArcDatum<Datum>, import("d3-selection").BaseType, any>;
export declare const exitArcs: (arcs: import("d3-selection").Selection<any, any, any, any>, duration: number, path: any) => void;
export declare const enterArcs: (arcs: import("d3-selection").Selection<any, any, any, any>, mouseOverHandler: any, mouseOutHandler: any) => void;
export declare const updateBackgroundRects: (updatingArcs: import("d3-selection").Selection<any, any, any, any>, centroid: any, visibility: string) => void;
export declare const updateTotal: (el: import("d3-selection").Selection<any, any, any, any>, label: string, options: {
    maxTotalFontSize: number;
    minTotalFontSize: number;
    innerRadius: number;
    yOffset: string;
}) => void;
export declare const computeTotal: (data: InputDatum[], valueAccessor: Accessor<InputDatum | PieArcDatum<Datum>, number>) => number;
export declare const computePercentages: (data: InputDatum[], valueAccessor: Accessor<InputDatum | PieArcDatum<Datum>, number>, total: number) => Datum[];
export declare const layout: (valueAccessor: Accessor<any, number>, angleRange: [number, number]) => Pie<any, any>;
export declare const removeArcTween: (computed: ComputedData, angleRange: [number, number]) => (d: PieArcDatum<Datum>) => (t: number) => string | null;
export declare const updateFilteredPathAttributes: (selection: import("d3-selection").Selection<any, any, any, any>, filterFunc: (d: Datum) => boolean, path: any) => void;
//# sourceMappingURL=renderer_utils.d.ts.map