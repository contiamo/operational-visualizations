import { PivotFrame } from "./PivotFrame";
import { IteratableFrame, Matrix, PivotProps, Schema } from "./types";

export default class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
  }

  public stats() {
    return {
      columns: this.schema.length,
      rows: this.data.length,
    };
  }

  public get(rowIndex: number, columnIndex: number) {
    return this.data[rowIndex][columnIndex];
  }

  public forEach(columns: Name | Name[], cb: (...columnValue: any[]) => void) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    const columnsIndex = columns.map(column => this.schema.findIndex(x => x.name === column));
    if (columnsIndex.some(x => x < 0)) {
      throw new Error(`Unknown column in ${columns}`);
    }
    this.data.forEach(dataRow => cb(...columnsIndex.map(columnIndex => dataRow[columnIndex])));
  }

  public pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>) {
    return new PivotFrame(this.schema, this.data, prop);
  }
}
