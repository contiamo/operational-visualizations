export type Matrix<T> = T[][];

export type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

export interface IteratableFrame<Name extends string> {
  forEach(columns: Name[], cb: (...values: any[]) => void): void;
  schema: Schema<Name>;
}

export interface PivotProps<Column, Row> {
  rows: Row[];
  columns: Column[];
}

/**
 * We call third type Measure by tradition, in Pandas this value is indeed measure - something numeric,
 * but in our case this can be a column with DataFrame (after groupBy).
 * Measure is what goes inside of cells in Pivot table.
 * Because of the way how Pivot table is constructed measures can go either to rows or to columns, not in both.
 *
 * +----------------+
 * |      | Columns |
 * +----------------+
 * | Rows | Measure |
 * +----------------+
 */
export type MddPivotProps<Column, Row, Measure> =
  | {
      rows: Row[];
      columns: Column[];
      rowsMeasures: Measure[];
    }
  | {
      rows: Row[];
      columns: Column[];
      columnsMeasures: Measure[];
    };
