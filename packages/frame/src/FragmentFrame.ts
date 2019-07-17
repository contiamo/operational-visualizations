// this is not circular dependency, because we use DataFrame as type
import { DataFrame } from "./DataFrame";
import { IteratableFrame, RawRow, ColumnCursor, Matrix, Schema } from "./types";
import { getData } from "./secret";
import { isCursor } from "./utils";
import { uniqueValueCombinations } from "./stats";

const isColumnCursor = <Name extends string>(column: any): column is ColumnCursor<Name> => {
  return column.index !== undefined;
};

export class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];
  private readonly origin: DataFrame<Name>;

  constructor(origin: DataFrame<Name>, index: number[]) {
    this.origin = origin;
    const [schema, data] = origin[getData]();
    this.schema = schema;
    this.data = data;
    this.index = index;
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  public groupBy(columns: Array<Name | ColumnCursor<Name>>): Array<FragmentFrame<Name>> {
    // If no columns are provided, returns an array with the current frame as a FragmentFrame as the sole entry.
    if (columns.length === 0) {
      return [this];
    }

    const columnCursors = columns.map(c => isCursor(c) ? c : this.getCursor(c))
    // Returns a FragmentFrame for every unique combination of column values.
    return uniqueValueCombinations(this, columnCursors).map(u => {
      const indices = this.data.reduce((arr, row, i): any => {
        if (columnCursors.every((cursor, j) => cursor(row) === u[j]) && this.index.includes(i)) {
          arr.push(i)
        }
        return arr
      }, [])

      return new FragmentFrame<Name>(this.origin, indices)
    })
  }

  public mapRows<A>(callback: (row: RawRow, index: number) => A) {
    return this.index.map((i, j) => callback(this.data[i], j));
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
