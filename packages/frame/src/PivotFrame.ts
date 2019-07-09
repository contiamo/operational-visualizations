import { FragmentFrame } from "./FragmentFrame";
import { Matrix, PivotProps, Schema } from "./types";

const intersect = <T>(...arr: T[][]): T[] => arr.reduce((prev, curr) => prev.filter(x => curr.includes(x)));

// theoretically it can be string | bool, but TS doesn't allow to use bool as index value
export type DimensionValue = string;

export class PivotFrame<Name extends string = string> {
  private readonly data: Matrix<any>;
  private readonly schema: Schema<Name>;
  private readonly prop: PivotProps<Name, Name>;

  protected rowHeadersInternal!: DimensionValue[][];
  protected columnHeadersInternal!: DimensionValue[][];
  protected columnIndex!: number[][];
  protected rowIndex!: number[][];
  protected frameWithoutPivoting!: FragmentFrame<Name>;

  // we need those for referential transperancy
  private readonly rowCache: Map<number, FragmentFrame<Name>>;
  private readonly columnCache: Map<number, FragmentFrame<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>, prop: PivotProps<Name, Name>) {
    this.schema = schema;
    this.data = data;
    this.prop = prop;
    this.rowCache = new Map<number, FragmentFrame<Name>>();
    this.columnCache = new Map<number, FragmentFrame<Name>>();
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
    if (this.prop.rows.length === 0) {
      return this.getFrameWithoutPivoting();
    }

    this.buildIndex();
    const row = this.rowIndex[rowIdentifier];
    if (row === undefined) {
      throw new Error(`Can't find row #${rowIdentifier}`);
    }
    if (!this.rowCache.has(rowIdentifier)) {
      this.rowCache.set(rowIdentifier, new FragmentFrame(this.schema, this.data, row));
    }
    return this.rowCache.get(rowIdentifier)!;
  }

  public column(columnIdentifier: number) {
    if (this.prop.columns.length === 0) {
      return this.getFrameWithoutPivoting();
    }

    this.buildIndex();
    const column = this.columnIndex[columnIdentifier];
    if (column === undefined) {
      throw new Error(`Can't find column #${columnIdentifier}`);
    }
    if (!this.columnCache.has(columnIdentifier)) {
      this.columnCache.set(columnIdentifier, new FragmentFrame(this.schema, this.data, column));
    }
    return this.columnCache.get(columnIdentifier)!;
  }

  public cell(rowIdentifier: number, columnIdentifier: number) {
    if (this.prop.rows.length === 0 && this.prop.columns.length === 0) {
      return this.getFrameWithoutPivoting();
    }

    this.buildIndex();
    if (this.prop.rows.length === 0) {
      const index = this.columnIndex[columnIdentifier][rowIdentifier];
      return new FragmentFrame(this.schema, this.data, index !== undefined ? [index] : []);
    }

    if (this.prop.columns.length === 0) {
      const index = this.rowIndex[rowIdentifier][columnIdentifier];
      return new FragmentFrame(this.schema, this.data, index !== undefined ? [index] : []);
    }

    const row = this.rowIndex[rowIdentifier];
    const column = this.columnIndex[columnIdentifier];
    const cell = intersect(row, column);
    return new FragmentFrame(this.schema, this.data, cell);
  }

  // This is very specific case when we need PivotFrame, but without pivoting itself.
  // We need it to show the grid with "pivoting" only by measures.
  // In this case `row`, `column` and `cell` methods will return the same result containing the whole data set
  private getFrameWithoutPivoting() {
    if (!this.frameWithoutPivoting) {
      this.frameWithoutPivoting = new FragmentFrame(this.schema, this.data, this.data.map((_, i) => i));
    }
    return this.frameWithoutPivoting;
  }

  private buildIndex() {
    if (this.columnIndex && this.rowIndex) {
      return;
    }

    const nameToIndex = this.schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );

    /**
     * We need those only for case when we pivot by one direction
     * e.g. when `this.prop.columns.length === 0` or `this.prop.rows.length === 0`
     */
    let maxColumnDepth = 0;
    let maxRowDepth = 0;

    const lastInRow = this.prop.rows.length - 1;
    const pivotByRows = this.prop.rows.map(dimension => nameToIndex[dimension]);
    /**
     * tree structure implemented as nested records
     * {[valueFromRowA]: {[valueFromRowB]: {...: [<numbers of rows in this.data with valueFromRowA, valueFromRowB ...>] }}}
     * It corresponds to `CREATE INDEX rowTreeIndex ON table (rowA, rowB, ...);` - in first level we will have unique values for [rowA],
     * in second level we will have unique values for [rowA, rowB] etc.
     * In the end there is a list of indexes of rows from original data.
     * If we need to find what rows (from the `this.data`) correspond to [valueFromRowA, valueFromRowB ...]
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
     * [[<numbers of rows in this.data with valueFromRowA, valueFromRowB ...>]]
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

    this.data.forEach((dataRow, rowNumber) => {
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
          maxRowDepth = Math.max(previousRow[dimensionValue].length, maxRowDepth);
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
          maxColumnDepth = Math.max(previousColumn[dimensionValue].length, maxColumnDepth);
        }
        previousColumn = previousColumn[dimensionValue];
      });
    });

    this.columnHeadersInternal =
      this.prop.columns.length === 0 ? Array.from({ length: maxRowDepth }).map(_ => []) : columnHeaders;
    this.rowHeadersInternal =
      this.prop.rows.length === 0 ? Array.from({ length: maxColumnDepth }).map(_ => []) : rowHeaders;

    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
  }
}
