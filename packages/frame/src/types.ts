/**
 * Can represent array of arrays or list of tuples or tuple of lists
 */
export type Matrix<T> = T[][];

export type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

/**
 * Initially it was tuple representing raw row in the frame and the implementation is still the same.
 *
 * But concentually it suppose to be `RowCursor`. So you take `RowCursor` and `ColumnCursor`
 * and can get value at their crossing (like x and y cooordinate).
 *
 * The fact that this is an array exposes implementation detail - DataFrame is row oriented storage.
 *
 * If we will keep exposing this implementation detail and rely on it a lot
 * at some point it would be hard to change implementation without breaking existing code.
 */
export type RowCursor = ReadonlyArray<any>;

/**
 * Cursor is a function which gets rowCursor from the IterableFrame.map
 * and returns value from the corresponding column in the given row.
 *
 * As well it contains `column` name and index, so you can do `rowCursor[column.index]`,
 * I guess it is more performant, but probably we will regret about it if we will change
 * implementation of `RowCursor`.
 *
 * `rowCursor[column.index]` exposes implementation details.
 */
export interface ColumnCursor<Name extends string, ValueInRawRow = any> {
  (rowCursor: RowCursor): ValueInRawRow;
  column: Name;
  index: number;
}

export interface WithCursor<Name extends string> {
  getCursor(column: Name): ColumnCursor<Name>;
}

export interface IterableFrame<Name extends string> extends WithCursor<Name> {
  /** needed for stats module */
  readonly schema: Schema<Name>;
  /** needed for visualisations */
  mapRows<Result>(callback: (rowCursor: RowCursor, rowIndex: number) => Result): Result[];
  /** needed for visualizations */
  groupBy(columns: Array<string | ColumnCursor<string>>): Array<IterableFrame<Name>>;
  /** needed for visualizations */
  uniqueValues(columns: Array<Name | ColumnCursor<Name>>): string[][];
  /** needed for visualizations */
  row(rowIndex: number): RowCursor;
}

export interface PivotProps<Column extends string, Row extends string> {
  rows: Row[];
  columns: Column[];
}
