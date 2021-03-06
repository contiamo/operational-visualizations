import flru, { flruCache } from "flru";
// this is not circular dependency, because we use DataFrame as type
import { DataFrame } from "./DataFrame";
import { FragmentFrame } from "./FragmentFrame";
import { PivotProps, WithCursor, DimensionValue } from "./types";
import { getData } from "./secret";

const intersect = <T>(...arr: T[][]): T[] => arr.reduce((prev, curr) => prev.filter(x => curr.includes(x)));

export class PivotFrame<Name extends string = string> implements WithCursor<Name> {
  private readonly prop: PivotProps<Name, Name>;
  private readonly origin: DataFrame<Name>;

  // protected because we expose them for PivotFramePreindexed
  protected rowHeadersInternal!: DimensionValue[][];
  protected columnHeadersInternal!: DimensionValue[][];
  protected columnIndex!: number[][];
  protected rowIndex!: number[][];

  // we need this for referential transparency
  private readonly cache: flruCache<FragmentFrame<Name>>;

  constructor(origin: DataFrame<Name>, prop: PivotProps<Name, Name>) {
    this.origin = origin;
    this.prop = prop;
    this.cache = flru(1024);
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  // reverse operation of pivot in the DataFrame
  // in Pandas this called melt
  public unpivot() {
    return this.origin;
  }

  /**
   * rows by which frame was pivoted e.g. rows from frame.pivot({ rows, columns })
   */
  public getPivotRows() {
    return this.prop.rows;
  }

  /**
   * columns by which frame was pivoted e.g. columns from frame.pivot({ rows, columns })
   */
  public getPivotColumns() {
    return this.prop.columns;
  }

  public rowHeaders() {
    this.buildIndex();
    return this.rowHeadersInternal;
  }

  public columnHeaders() {
    this.buildIndex();
    return this.columnHeadersInternal;
  }

  public row(rowIdentifier: number) {
    if (this.prop.rows.length === 0) return this.getFrameWithoutPivoting();
    this.buildIndex();

    const row = this.rowIndex[rowIdentifier];
    if (row === undefined) {
      throw new Error(`Can't find row #${rowIdentifier}`);
    }
    const key = `${rowIdentifier}r`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new FragmentFrame(this.origin, row));
    }
    return this.cache.get(key)!;
  }

  public column(columnIdentifier: number) {
    if (this.prop.columns.length === 0) return this.getFrameWithoutPivoting();
    this.buildIndex();

    const column = this.columnIndex[columnIdentifier];
    if (column === undefined) {
      throw new Error(`Can't find column #${columnIdentifier}`);
    }

    const key = `${columnIdentifier}c`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new FragmentFrame(this.origin, column));
    }
    return this.cache.get(key)!;
  }

  public cell(rowIdentifier: number, columnIdentifier: number) {
    if (this.prop.rows.length === 0 && this.prop.columns.length === 0) {
      return this.getFrameWithoutPivoting();
    } else if (this.prop.rows.length === 0) {
      return this.column(columnIdentifier);
    } else if (this.prop.columns.length === 0) {
      return this.row(rowIdentifier);
    }
    this.buildIndex();

    const key = `${rowIdentifier}x${columnIdentifier}`;
    if (!this.cache.has(key)) {
      const row = this.rowIndex[rowIdentifier];
      const column = this.columnIndex[columnIdentifier];
      const cell = intersect(row, column);
      this.cache.set(key, new FragmentFrame(this.origin, cell));
    }
    return this.cache.get(key)!;
  }

  // This is very specific case when we need PivotFrame, but without pivoting itself.
  // We need it to show the grid with "pivoting" only by measures.
  // In this case `row`, `column` and `cell` methods will return the same result containing the whole data set
  private getFrameWithoutPivoting() {
    const key = `0`;
    if (!this.cache.has(key)) {
      const [, data] = this.origin[getData]();
      this.cache.set(key, new FragmentFrame(this.origin, data.map((_, i) => i)));
    }
    return this.cache.get(key)!;
  }

  private buildIndex() {
    if (this.columnIndex && this.rowIndex) {
      return;
    }
    const [schema, data] = this.origin[getData]();

    const nameToIndex = schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );

    const lastInRow = this.prop.rows.length - 1;
    const pivotByRows = this.prop.rows.map(dimension => nameToIndex[dimension]);
    /**
     * tree structure implemented as nested records
     * {[valueFromRowA]: {[valueFromRowB]: {...: [<numbers of rows in this.data with valueFromRowA, valueFromRowB ...>] }}}
     * It corresponds to `CREATE INDEX rowTreeIndex ON table (rowA, rowB, ...);` - in first level we will have unique values for [rowA],
     * in second level we will have unique values for [rowA, rowB] etc.
     * In the end there is a list of indexes of rows from original data.
     * If we need to find what rows (from the `data`) correspond to [valueFromRowA, valueFromRowB ...]
     * we can do following rowTreeIndex[valueFromRowA][valueFromRowB][...] and we will get array on indexes
     */
    const rowTreeIndex = {} as Record<DimensionValue, any>;
    /**
     * matrix structure implemented as array of arrays
     * [[valueFromRowA, valueFromRowB, ...]]
     * It corresponds to `SELECT rowA, rowB, ... FROM table GROUP BY rowA, rowB, ...`
     */
    const rowHeaders: DimensionValue[][] = [];
    /**
     * matrix structure implemented as array of arrays
     * [[<numbers of rows in data with valueFromRowA, valueFromRowB ...>]]
     * first row in rowHeaders corresponds to first row in rowHeaders etc.
     */
    const rowIndex: number[][] = [];

    const lastInColumn = this.prop.columns.length - 1;
    const pivotByColumns = this.prop.columns.map(dimension => nameToIndex[dimension]);
    // see rowTreeIndex
    const columnTreeIndex = {} as Record<DimensionValue, any>;
    // see rowHeaders
    const columnHeaders: DimensionValue[][] = [];
    // see rowIndex
    const columnIndex: number[][] = [];

    data.forEach((dataRow, rowNumber) => {
      const rowHeader: DimensionValue[] = [];
      let previousRow: Record<DimensionValue, any> = rowTreeIndex;

      pivotByRows.forEach((dimensionIndex, i) => {
        const dimensionValue = dataRow[dimensionIndex];
        rowHeader.push(dimensionValue);

        if (previousRow[dimensionValue] === undefined) {
          if (i === lastInRow) {
            rowHeaders.push(rowHeader);
            rowIndex[rowHeaders.length - 1] = previousRow[dimensionValue] = [];
          } else {
            previousRow[dimensionValue] = {};
          }
        }
        if (i === lastInRow) {
          previousRow[dimensionValue].push(rowNumber);
        }
        previousRow = previousRow[dimensionValue];
      });

      const columnHeader: DimensionValue[] = [];
      let previousColumn: Record<DimensionValue, any> = columnTreeIndex;

      pivotByColumns.forEach((dimensionIndex, i) => {
        const dimensionValue = dataRow[dimensionIndex];
        columnHeader.push(dimensionValue);
        if (previousColumn[dimensionValue] === undefined) {
          if (i === lastInColumn) {
            columnHeaders.push(columnHeader);
            columnIndex[columnHeaders.length - 1] = previousColumn[dimensionValue] = [];
          } else {
            previousColumn[dimensionValue] = {};
          }
        }
        if (i === lastInColumn) {
          previousColumn[dimensionValue].push(rowNumber);
        }
        previousColumn = previousColumn[dimensionValue];
      });
    });

    this.columnHeadersInternal = columnHeaders;
    this.rowHeadersInternal = rowHeaders;
    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
  }
}
