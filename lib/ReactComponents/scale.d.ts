import { IteratableFrame } from "../DataFrame/types";
export interface ScaleProps<Name extends string> {
    frame: IteratableFrame<Name>;
    column: Name;
    size: number;
}
/**
 * Takes `frame`, `column` (values in the column supposed to be strings) and `size` of container and
 * returns ScaleBand
 */
export declare const getScaleBand: <Name extends string>({ frame, column, size }: ScaleProps<Name>) => import("d3-scale").ScaleBand<string>;
/**
 * Takes `frame`, `column` (values in the column supposed to be numbers) and `size` of container and
 * returns ScaleLinear
 */
export declare const getScaleLinear: <Name extends string>({ frame, column, size }: ScaleProps<Name>) => import("d3-scale").ScaleLinear<number, number>;
export declare const useScaleBand: <Name extends string>({ frame, column, size }: ScaleProps<Name>) => import("d3-scale").ScaleBand<string>;
export declare const useScaleLinear: <Name extends string>({ frame, column, size }: ScaleProps<Name>) => import("d3-scale").ScaleLinear<number, number>;
//# sourceMappingURL=scale.d.ts.map