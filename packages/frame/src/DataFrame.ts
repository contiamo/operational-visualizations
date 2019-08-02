import { PivotFrame } from "./PivotFrame";
import { ColumnCursor, IterableFrame, Matrix, PivotProps, Schema, RowCursor } from "./types";
import { getData } from "./secret";
import { isCursor, hashCursors } from "./utils";
import { GroupFrame } from "./GroupFrame";
import flru, { flruCache } from "flru";

export class DataFrame<Name extends string = string> implements IterableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  private readonly cursorCache: Map<Name, ColumnCursor<Name>>;
  private readonly referentialCache: flruCache;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
    this.cursorCache = new Map();
    // this one is small cache, because it is for rare operations
    this.referentialCache = flru(5);
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

  public row(rowIndex: number) {
    return this.data[rowIndex];
  }

  public getCursor(column: Name): ColumnCursor<Name> {
    if (!this.cursorCache.has(column)) {
      const index = this.schema.findIndex(x => x.name === column);
      if (index === -1) {
        throw new Error(`Unknown column: ${column}`);
      }
      const cursor = (row => row[index]) as ColumnCursor<Name>;
      cursor.column = column;
      cursor.index = index;
      this.cursorCache.set(column, cursor);
    }
    return this.cursorCache.get(column)!;
  }

  public pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>): PivotFrame<Name> {
    const columnCursors = prop.columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const rowCursors = prop.rows.map(r => (isCursor(r) ? r : this.getCursor(r)));
    const hash = `${hashCursors(columnCursors)}x${hashCursors(rowCursors)}`;
    if (!this.referentialCache.has(hash)) {
      this.referentialCache.set(hash, new PivotFrame(this, prop));
    }
    return this.referentialCache.get(hash);
  }

  public groupBy(columns: Array<Name | ColumnCursor<Name>>): GroupFrame<Name> {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const hash = hashCursors(columnCursors);
    if (!this.referentialCache.has(hash)) {
      this.referentialCache.set(hash, new GroupFrame(this, columnCursors));
    }
    return this.referentialCache.get(hash);
  }

  public uniqueValues(columns: Array<Name | ColumnCursor<Name>>) {
    return this.groupBy(columns).uniqueValues();
  }

  public mapRows<A>(callback: (row: RowCursor[], index: number) => A) {
    return this.data.map(callback);
  }

  // for internal use only
  [getData]() {
    return [this.schema, this.data] as const;
  }
}
