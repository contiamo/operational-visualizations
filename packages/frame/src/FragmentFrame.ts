// this is circular dependency, on the other side we want to make origin optional
import { DataFrame } from "./DataFrame";

import { IteratableFrame, Matrix, Schema, WithCursor, RawRow, ColumnCursor } from "./types";

type FragmentFrameOptions<Name extends string> = {
  index: number[];
  origin?: WithCursor<Name>;
};

export class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];
  private readonly origin: WithCursor<Name>;

  constructor(schema: Schema<Name>, data: Matrix<any>, { index, origin }: FragmentFrameOptions<Name>) {
    this.schema = schema;
    this.data = data;
    this.index = index;
    this.origin = origin || new DataFrame(schema, data);
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  public mapRows<A>(callback: (row: RawRow, index: number) => A) {
    return this.index.map((i, j) => callback(this.data[i], j));
  }

  // we need this function for table display
  public peak(column: Name | ColumnCursor<Name>) {
    const columnIndex = "index" in column ? column.index : this.schema.findIndex(x => x.name === column);
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
