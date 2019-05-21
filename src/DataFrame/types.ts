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
 * Instead it can be an object (cursor), through which we can access exact value,
 * this way we would be able to change implementation to column oriented storage
 * without changing external code.
 */
type RawRow = any[];

export interface IteratableFrame<Name extends string> {
  /** needed for stats module */
  forEach(columns: Name[], cb: (...values: any[]) => void): void;
  readonly schema: Schema<Name>;
  /** needed for visualisations */
  map<Result>(callback: (row: RawRow, index: number) => Result): Result[];
}

export interface PivotProps<Column, Row> {
  rows: Row[];
  columns: Column[];
}

/**
 * accessor is a function which gets row from the IteratableFrame.map
 * and returns value from the corresponding column.
 *
 * As well it contains `column` name and index, so you can do `row[accessor.index]`,
 * I guess it is more performant, but probably we will regret about it if we will change
 * implementation of `RawRow`.
 */
export interface Accessor<Name extends string, ValueInRawRow = any> {
  (row: RawRow): ValueInRawRow;
  column: Name;
  index: number;
}
