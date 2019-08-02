import { PivotFrame } from "./PivotFrame";
import { ColumnCursor, IterableFrame, Matrix, PivotProps, Schema, RowCursor } from "./types";
import { getData } from "./secret";
import { isCursor, hashCursors } from "./utils";
import { buildIndex } from "./stats";
import { FragmentFrame } from "./FragmentFrame";

export class DataFrame<Name extends string = string> implements IterableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;

  private readonly cursorCache: Map<Name, ColumnCursor<Name>>;
  private readonly groupByCache: Map<string, Array<IterableFrame<Name>>>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
    this.cursorCache = new Map();
    this.groupByCache = new Map();
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

  public groupBy(columns: Array<Name | ColumnCursor<Name>>): Array<IterableFrame<Name>> {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const hash = hashCursors(columnCursors);
    if (!this.groupByCache.has(hash)) {
      // If no columns are provided, returns an array with the current frame as the sole entry.
      if (columns.length === 0) {
        this.groupByCache.set(hash, [this]);
      } else {
        const { index } = buildIndex(this, columnCursors);
        this.groupByCache.set(hash, index.map(i => new FragmentFrame<Name>(this, i)));
      }
    }
    return this.groupByCache.get(hash)!;
  }

  public uniqueValues(columns: Array<Name | ColumnCursor<Name>>): string[][] {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    const { uniqueValues } = buildIndex(this, columnCursors);
    return uniqueValues;
  }

  public mapRows<A>(callback: (row: RowCursor[], index: number) => A) {
    return this.data.map(callback);
  }

  public pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>): PivotFrame<Name> {
    return new PivotFrame(this, prop);
  }

  // for internal use only
  [getData]() {
    return [this.schema, this.data] as const;
  }
}
