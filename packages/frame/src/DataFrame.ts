import { PivotFrame } from "./PivotFrame";
import { ColumnCursor, IteratableFrame, Matrix, PivotProps, Schema, RawRow } from "./types";

export class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  private readonly cursorCache: Map<Name, ColumnCursor<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
    this.cursorCache = new Map();
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

  public getCursor(column: Name): ColumnCursor<Name> {
    if (!this.cursorCache.has(column)) {
      const index = this.schema.findIndex(x => x.name === column);
      if (index === -1) {
        throw new Error(`Unknown column: ${column}`);
      }
      const cursor = ((row: RawRow[]) => row[index]) as ColumnCursor<Name>;
      cursor.column = column;
      cursor.index = index;
      this.cursorCache.set(column, cursor);
    }
    return this.cursorCache.get(column)!;
  }

  public mapRows<A>(callback: (row: RawRow[], index: number) => A) {
    return this.data.map(callback);
  }

  public pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>): PivotFrame<Name> {
    return new PivotFrame(this, prop);
  }

  // for internal use only
  __getData() {
    return [this.schema, this.data] as const;
  }
}
