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

  // we need this function for table display
  public peak(column: Name) {
    const columnIndex = this.schema.findIndex(x => x.name === column);
    if (columnIndex < 0) {
      throw new Error(`Unknown column ${column}`);
    }
    if (this.index.length < 0 && this.index.length > 1) {
      throw new Error(`Only frame with exactly one row are good for peak`);
    }
    return this.data[this.index[0]][columnIndex];
  }

  // we need this function for semiotic
  public toRecordList() {
    const columns = this.schema.map((x, index) => ({ ...x, index })).filter(x => x.type === "number");
    return this.index.map(rowNumber => {
      const dataRow = this.data[rowNumber];
      return columns.reduce(
        (result, column) => {
          result[column.name] = dataRow[column.index];
          return result;
        },
        {} as Record<Name, any>,
      );
    });
  }
}
