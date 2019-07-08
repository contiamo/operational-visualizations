/**
 * There was attempt to optimize state for frame,
 * by iterating only twice over frame and calculate all values and memoise the result.
 * Not sure it is the optimal way.
 *
 * TODO: revise this later, as well revise `forEach` method,
 *  maybe it should return row the same way as `map` does.
 */
import { IteratableFrame } from "./types";
export declare const uniqueValues: <Name extends string>(frame: IteratableFrame<Name>, column: Name) => string[];
export declare const maxValue: <Name extends string>(frame: IteratableFrame<Name>, column: Name) => number;
//# sourceMappingURL=stats.d.ts.map