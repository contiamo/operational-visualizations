/**
 * Can represent array of arrays or list of tuples or tuple of lists
 */
export type Matrix<T> = T[][];

export type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

export interface IteratableFrame<Name extends string> {
  forEach(columns: Name[], cb: (...values: any[]) => void): void;
  map<A>(callback: (row: any[], index: number) => A): A[];
  readonly schema: Schema<Name>;
}

export interface PivotProps<Column, Row> {
  rows: Row[];
  columns: Column[];
}
