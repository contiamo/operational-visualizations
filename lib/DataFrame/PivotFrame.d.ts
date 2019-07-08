import { FragmentFrame } from "./FragmentFrame";
import { Matrix, PivotProps, Schema } from "./types";
export declare type DimensionValue = string;
export declare class PivotFrame<Name extends string = string> {
    private readonly data;
    private readonly schema;
    private readonly prop;
    protected rowHeadersInternal: DimensionValue[][];
    protected columnHeadersInternal: DimensionValue[][];
    protected columnIndex: number[][];
    protected rowIndex: number[][];
    private readonly rowCache;
    private readonly columnCache;
    constructor(schema: Schema<Name>, data: Matrix<any>, prop: PivotProps<Name, Name>);
    /**
     * rows by which frame was pivoted e.g. rows from frame.pivot({ rows, columns })
     */
    getPivotRows(): Name[];
    /**
     * columns by which frame was pivoted e.g. columns from frame.pivot({ rows, columns })
     */
    getPivotColumns(): Name[];
    rowHeaders(): string[][];
    columnHeaders(): string[][];
    row(rowIdentifier: number): FragmentFrame<Name>;
    column(columnIdentifier: number): FragmentFrame<Name>;
    cell(rowIdentifier: number, columnIdentifier: number): FragmentFrame<Name>;
    private buildIndex;
}
//# sourceMappingURL=PivotFrame.d.ts.map