import { PivotFrame } from "./PivotFrame";
import { IteratableFrame, Matrix, PivotProps, Schema } from "./types";

export default class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
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
    // check if the input params are valid
    const rowDimensions = prop.rows.length;
    const columnDimensions = prop.columns.length;
    if (rowDimensions === 0) {
      throw new Error("Please provide at least one row or rowDimension");
    }
    if (columnDimensions === 0) {
      throw new Error("Please provide at least one column or columnDimension");
    }

    return new PivotFrame(this.schema, this.data, prop);
  }
}
