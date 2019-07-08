import { PivotFrame } from "./PivotFrame";
import { ColumnCursor, IteratableFrame, Matrix, PivotProps, Schema } from "./types";
export default class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
    private readonly data;
    readonly schema: Schema<Name>;
    private readonly cursorCache;
    constructor(schema: Schema<Name>, data: Matrix<any>);
    stats(): {
        columns: number;
        rows: number;
    };
    cell(rowIndex: number, columnIndex: number): any;
    getCursor(column: Name): ColumnCursor<Name>;
    mapRows<A>(callback: (row: any[], index: number) => A): A[];
    forEach(columns: Name | Name[], cb: (...columnValue: any[]) => void): void;
    pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>): PivotFrame<Name>;
}
//# sourceMappingURL=DataFrame.d.ts.map