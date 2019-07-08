import { ScaleTime } from "d3-scale";
import { DiscreteInputDatum, TimeAxisOptions } from "./typings";
export declare const tickFormatter: (interval: "hour" | "day" | "week" | "month" | "quarter" | "year") => (date: Date) => string;
export declare const ticksInDomain: (options: TimeAxisOptions) => Date[];
export declare const adjustRange: (datum: DiscreteInputDatum<Date, TimeAxisOptions>) => [number, number];
declare const _default: (data: Partial<Record<"x1" | "x2" | "y1" | "y2", DiscreteInputDatum<Date, TimeAxisOptions>>>) => Partial<Record<"x1" | "x2" | "y1" | "y2", import("./typings").BaseAxisComputed<ScaleTime<number, number>, Date> & {
    range: [number, number];
    width?: ((seriesId: string) => number) | undefined;
    offset?: ((seriesId: string) => number) | undefined;
}>>;
export default _default;
//# sourceMappingURL=compute_time_axes.d.ts.map