import { ColumnCursor, IteratableFrame, Matrix, Schema } from "./types";

export class FragmentFrame<Name extends string = string>
  implements IteratableFrame<Name> {
  private readonly data: Matrix<any>;
  public readonly schema: Schema<Name>;
  private readonly index: number[];
  private readonly cursorCache: Map<Name, ColumnCursor<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>, index: number[]) {
    this.schema = schema;
    this.data = data;
    this.index = index;
    this.cursorCache = new Map();
  }

  public mapRows<A>(callback: (row: any[], index: number) => A) {
    return this.index.map((i, j) => callback(this.data[i], j));
  }

  public forEach(columns: Name | Name[], cb: (...columnValue: any[]) => void) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    const columnsIndex = columns.map(column =>
      this.schema.findIndex(x => x.name === column)
    );
    if (columnsIndex.some(x => x < 0)) {
      throw new Error(`Unknown column in ${columns}`);
    }

    this.index.forEach(i =>
      cb(...columnsIndex.map(columnIndex => this.data[i][columnIndex]))
    );
  }

  public getCursor(column: Name): ColumnCursor<Name> {
    if (!this.cursorCache.has(column)) {
      const index = this.schema.findIndex(x => x.name === column);
      if (index === -1) {
        throw new Error(`Unknown column: ${column}`);
      }
      const cursor = ((row: any[]) => row[index]) as ColumnCursor<Name>;
      cursor.column = column;
      cursor.index = index;
      this.cursorCache.set(column, cursor);
    }
    return this.cursorCache.get(column)!;
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
