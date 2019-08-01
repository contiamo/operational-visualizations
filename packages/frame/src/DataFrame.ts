import { PivotFrame } from "./PivotFrame";
import { ColumnCursor, IterableFrame, Matrix, PivotProps, Schema, RowCursor } from "./types";
import { getData } from "./secret";
import { isCursor } from "./utils";
import { uniqueValueCombinations } from "./stats";
import { FragmentFrame } from "./FragmentFrame";

export class DataFrame<Name extends string = string> implements IterableFrame<Name> {
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
    // If no columns are provided, returns an array with the current frame as the sole entry.
    if (columns.length === 0) {
      return [this];
    }

    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    // Returns a FragmentFrame for every unique combination of column values.
    return uniqueValueCombinations(this, columnCursors).map(u => {
      const indices = this.data.reduce((arr, row, i): any => {
        if (columnCursors.every((cursor, j) => cursor(row) === u[j])) {
          arr.push(i);
        }
        return arr;
      }, []);

      return new FragmentFrame<Name>(this, indices);
    });
  }

  public uniqueValues(columns: Array<Name | ColumnCursor<Name>>): string[][] {
    const columnCursors = columns.map(c => (isCursor(c) ? c : this.getCursor(c)));
    return uniqueValueCombinations(this, columnCursors);
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
