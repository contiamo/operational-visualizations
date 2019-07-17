import { FragmentFrame } from "./FragmentFrame";

/**
 * Can represent array of arrays or list of tuples or tuple of lists
 */
export type Matrix<T> = T[][];

export type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

/**
 * Tuple representing raw row in the frame.
 *
 * At the moment it is array of any, but we can try to derive more precise type from the Schema.
 *
 * We expose implementation details with the fact that row is an array `any[]`.
 * Instead we can use RowCursor, this way we would be able to change implementation to column oriented storage
 * without changing external code.
 */
export type RawRow = any[];

export interface WithCursor<Name extends string> {
  getCursor(column: Name): ColumnCursor<Name>;
}

export interface IteratableFrame<Name extends string> extends WithCursor<Name> {
  /** needed for stats module */
  readonly schema: Schema<Name>;
  /** needed for visualisations */
  mapRows<Result>(callback: (row: RawRow, index: number) => Result): Result[];
  /** needed for visualizations */
  groupBy(columns: Array<string | ColumnCursor<string>>): Array<FragmentFrame<Name>>
}

export interface PivotProps<Column extends string, Row extends string> {
  rows: Row[];
  columns: Column[];
}

/**
 * Cursor is a function which gets row from the IteratableFrame.map
 * and returns value from the corresponding column in the given row.
 *
 * As well it contains `column` name and index, so you can do `row[accessor.index]`,
 * I guess it is more performant, but probably we will regret about it if we will change
 * implementation of `RawRow`.
 */
export interface ColumnCursor<Name extends string, ValueInRawRow = any> {
  (row: RawRow): ValueInRawRow;
  column: Name;
  index: number;
}
