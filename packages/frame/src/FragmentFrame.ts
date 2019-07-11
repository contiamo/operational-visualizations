import { DataFrame } from "./DataFrame";
import { IteratableFrame, WithCursor, RawRow, ColumnCursor, Matrix, Schema } from "./types";
import { getData } from "./secret";

const isColumnCursor = <Name extends string>(column: any): column is ColumnCursor<Name> => {
  return column.index !== undefined;
};

export class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];
  private readonly origin: WithCursor<Name>;

  constructor(origin: DataFrame<Name>, index: number[]) {
    this.schema = origin[getData]()[0];
    this.data = origin[getData]()[1];
    this.index = index;
    this.origin = origin;
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
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
      // if (process.env.NODE_ENV === "development") {
      //   console.warn(`Trying to peak value of empty Frame`);
      // }
      // empty cell, if there is not enough data for pivoting
      return null;
    }

    return this.data[this.index[0]][columnIndex];
  }
}
