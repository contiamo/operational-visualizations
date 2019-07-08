import { ScaleLinear } from "d3-scale";
import { InputDatum, QuantAxisOptions } from "./typings";
declare type Formatter = (value: number) => string;
export declare const computeDomain: (data: number[], start?: number | undefined, end?: number | undefined) => [number, number];
export declare const extentCushion: (extent: [number, number]) => [number, number];
export declare const guess: (data?: number[]) => [number, number];
export declare const computeTickNumber: (range: [number, number], tickSpacing: number, minTicks?: number) => number;
export declare const containsZero: (step: [number, number, number]) => number[] | undefined;
declare const _default: (data: Partial<Record<"x1" | "x2" | "y1" | "y2", InputDatum<number, QuantAxisOptions>>>, formatter?: Formatter | undefined) => Partial<Record<"x1" | "x2" | "y1" | "y2", import("./typings").BaseAxisComputed<ScaleLinear<number, number>, number>>>;
export default _default;
//# sourceMappingURL=compute_quant_axes.d.ts.map