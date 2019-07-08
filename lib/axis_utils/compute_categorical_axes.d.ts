import { ScaleBand } from "d3-scale";
import { CategoricalAxisOptions, DiscreteInputDatum } from "./typings";
export declare const adjustRange: (datum: DiscreteInputDatum<string, CategoricalAxisOptions>) => [number, number];
declare const _default: (data: Partial<Record<"x1" | "x2" | "y1" | "y2", DiscreteInputDatum<string, CategoricalAxisOptions>>>) => Partial<Record<"x1" | "x2" | "y1" | "y2", import("./typings").BaseAxisComputed<ScaleBand<string>, string> & {
    range: [number, number];
    width?: ((seriesId: string) => number) | undefined;
    offset?: ((seriesId: string) => number) | undefined;
}>>;
export default _default;
//# sourceMappingURL=compute_categorical_axes.d.ts.map