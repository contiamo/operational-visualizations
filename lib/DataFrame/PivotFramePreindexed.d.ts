import { DimensionValue, PivotFrame } from "./PivotFrame";
import { Matrix, PivotProps, Schema } from "./types";
/**
 * This class exposes internal implementation of PivotFrame,
 * but it allows you to do optimisation in case you already have indexed prebuilt,
 * for example from the server response.
 * It means that the class can break without notice if we will change implementation,
 * TypeScript will complain though.
 */
export declare class PivotFramePreindexed<Name extends string = string> extends PivotFrame<Name> {
    constructor(schema: Schema<Name>, data: Matrix<any>, prop: PivotProps<Name, Name> & {
        rowHeadersInternal: DimensionValue[][];
        columnHeadersInternal: DimensionValue[][];
        columnIndex: number[][];
        rowIndex: number[][];
    });
}
//# sourceMappingURL=PivotFramePreindexed.d.ts.map