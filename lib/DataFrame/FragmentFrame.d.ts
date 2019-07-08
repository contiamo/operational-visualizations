import { IteratableFrame, Matrix, Schema } from "./types";
export declare class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
    private readonly data;
    readonly schema: Schema<Name>;
    private readonly index;
    constructor(schema: Schema<Name>, data: Matrix<any>, index: number[]);
    mapRows<A>(callback: (row: any[], index: number) => A): A[];
    forEach(columns: Name | Name[], cb: (...columnValue: any[]) => void): void;
    peak(column: Name): any;
}
//# sourceMappingURL=FragmentFrame.d.ts.map