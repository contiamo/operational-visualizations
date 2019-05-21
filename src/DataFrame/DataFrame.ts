import { PivotFrame } from "./PivotFrame";
import { IteratableFrame, Matrix, PivotProps, Schema } from "./types";

export interface Accessor<Name extends string> {
  (row: any[]): any;
  column: Name;
}

export default class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  private readonly accessorCache: Map<Name, Accessor<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
    this.accessorCache = new Map();
  }

  public stats() {
    return {
      columns: this.schema.length,
      rows: this.data.length,
    };
  }

  public cell(rowIndex: number, columnIndex: number) {
    return this.data[rowIndex][columnIndex];
  }

  public map<A>(callback: (row: any[], index: number) => A) {
    return this.data.map(callback);
  }

  public getAccessor(column: Name): Accessor<Name> {
    if (!this.accessorCache.has(column)) {
      const index = this.schema.findIndex(x => x.name === column);
      if (index === -1) {
        throw new Error(`There is no column ${column}`);
      }
      const accessor = ((row: any[]) => row[index]) as Accessor<Name>;
      accessor.column = column;
      this.accessorCache.set(column, accessor);
    }
    return this.accessorCache.get(column)!;
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
    if (prop.rows.length === 0 && prop.columns.length === 0) {
      throw new Error("Please provide at least one row or column");
    }
    return new PivotFrame(this.schema, this.data, prop);
  }
}
