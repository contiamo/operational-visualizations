import { IteratableFrame, Matrix, Schema } from "./types";

export class FragmentFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Readonly<Matrix<any>>;
  public readonly schema: Readonly<Schema<Name>>;
  private readonly index: number[];

  constructor(schema: Schema<Name>, data: Matrix<any>, index: number[]) {
    this.schema = schema;
    this.data = data;
    this.index = index;
  }

  public forEach(columns: Name | Name[], cb: (...columnValue: any[]) => void) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    const columnsIndex = columns.map(column => this.schema.findIndex(x => x.name === column));
    if (columnsIndex.some(x => x < 0)) {
      throw new Error(`Unknown column in ${columns}`);
    }

    this.index.forEach(i => cb(...columnsIndex.map(columnIndex => this.data[i][columnIndex])));
  }
}
