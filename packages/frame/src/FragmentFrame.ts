import { IteratableFrame, Matrix, Schema } from "./types";

export class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];

  constructor(schema: Schema<Name>, data: Matrix<any>, index: number[]) {
    this.schema = schema;
    this.data = data;
    this.index = index;
  }

  public mapRows<A>(callback: (row: any[], index: number) => A) {
    return this.index.map((i, j) => callback(this.data[i], j));
  }

  // we need this function for table display
  public peak(column: Name) {
    const columnIndex = this.schema.findIndex(x => x.name === column);
    if (columnIndex < 0) {
      throw new Error(`Unknown column ${column}`);
    }
    if (this.index.length > 1) {
      throw new Error(`Only frame with exactly one row are good for peak`);
    }
    if (this.index.length === 0) {
      // empty cell, if there is not enough data for pivoting
      return null;
    }

    return this.data[this.index[0]][columnIndex];
  }
}
