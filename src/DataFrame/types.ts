/**
 * Can represent array of arrays or list of tuples or tuple of lists
 */
export type Matrix<T> = T[][];

export type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

export interface IteratableFrame<Name extends string> {
  /** needed for stats module */
  forEach(columns: Name[], cb: (...values: any[]) => void): void;
  readonly schema: Schema<Name>;
  /** needed for visualisations */
  map<A>(callback: (row: any[], index: number) => A): A[];
}

export interface PivotProps<Column, Row> {
  rows: Row[];
  columns: Column[];
}
