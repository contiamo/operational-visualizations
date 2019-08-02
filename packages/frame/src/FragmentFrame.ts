// this is not circular dependency, because we use DataFrame as type
import { DataFrame } from "./DataFrame";
import { IterableFrame, RowCursor, ColumnCursor, Matrix, Schema } from "./types";
import { getData } from "./secret";
import { isCursor, hashCursors } from "./utils";
import { buildIndex } from "./stats";

const isColumnCursor = <Name extends string>(column: any): column is ColumnCursor<Name> => {
  return column.index !== undefined;
};

export class FragmentFrame<Name extends string = string> implements IterableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];
  private readonly origin: DataFrame<Name>;
  private readonly groupByCache: Map<string, any>;

  constructor(origin: DataFrame<Name>, index: number[]) {
    this.origin = origin;
    const [schema, data] = origin[getData]();
    this.schema = schema;
    this.data = data;
    this.index = index;
    this.groupByCache = new Map();
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  public groupBy(columns: Array<Name | ColumnCursor<Name>>): Array<IterableFrame<Name>> {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const hash = hashCursors(columnCursors);
    if (!this.groupByCache.has(hash)) {
      // If no columns are provided, returns an array with the current frame as the sole entry.
      if (columns.length === 0) {
        this.groupByCache.set(hash, [this]);
      } else {
        const { index } = buildIndex(this, columnCursors);
        this.groupByCache.set(hash, index.map(i => new FragmentFrame<Name>(this.origin, i)));
      }
    }
    return this.groupByCache.get(hash);
  }

  public uniqueValues(columns: Array<Name | ColumnCursor<Name>>): string[][] {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const { uniqueValues } = buildIndex(this, columnCursors);
    return uniqueValues;
  }

  public mapRows<A>(callback: (row: RowCursor, index: number) => A) {
    return this.index.map((i, j) => callback(this.data[i], j));
  }

  public row(rowIndex: number) {
    return this.data[this.index[rowIndex]];
  }

  // for internal use only
  [getData]() {
    return [this.schema, this.data, this.index] as const;
  }

  // we need this function for table display
  public peak(column: Name | ColumnCursor<Name>) {
    const columnIndex = isColumnCursor(column) ? column.index : this.schema.findIndex(x => x.name === column);
    if (columnIndex < 0) {
      throw new Error(`Unknown column ${column}`);
    }
    if (this.index.length > 1) {
      throw new Error(`Only frame with exactly one row are good for peak`);
    }
    if (this.index.length === 0) {
      // https://github.com/contiamo/operational-visualizations/issues/72
      // if (process.env.NODE_ENV === "development") {
      //   console.warn(`Trying to peak value of empty Frame`);
      // }
      // empty cell, if there is not enough data for pivoting
      return null;
    }

    return this.data[this.index[0]][columnIndex];
  }
}
