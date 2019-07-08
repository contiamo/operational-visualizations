import { Dimensions, Point, Position } from "../shared/typings";
export declare const calculateLabelPosition: (focus: Point, label: Dimensions, drawing: {
    [key: string]: number;
}, offset: number, position: string) => {
    left: number;
    top: number;
    position: string;
};
export declare const verticalCenter: (focus: Point, label: Dimensions, drawing: {
    [key: string]: number;
}) => number;
export declare const horizontalCenter: (focus: Point, label: Dimensions, drawing: {
    [key: string]: number;
}) => number;
export declare const drawHidden: (canvasEl: import("d3-selection").Selection<any, any, any, any>, type: string) => import("d3-selection").Selection<any, any, any, any>;
export declare const labelDimensions: (focusEl: import("d3-selection").Selection<any, any, any, any>) => Dimensions;
export declare const positionLabel: (el: import("d3-selection").Selection<any, any, any, any>, focus: Point, label: Dimensions, drawing: {
    [key: string]: number;
}, offset?: number, position?: string, displayArrow?: boolean) => void;
export declare const drawVisible: (focusEl: import("d3-selection").Selection<any, any, any, any>, labelPlacement: Position) => void;
//# sourceMappingURL=focus_utils.d.ts.map