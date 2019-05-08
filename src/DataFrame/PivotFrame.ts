import { FragmentFrame } from "./FragmentFrame";
import { Matrix, PivotProps, Schema } from "./types";

const intersect = <T>(...arr: T[][]): T[] => arr.reduce((prev, curr) => prev.filter(x => curr.includes(x)));

// theoretically it can be bool, but TS doesn't allow to use bool as index value
type DimensionValue = string;

export class PivotFrame<Name extends string = string> {
  private readonly data: Matrix<any>;
  private readonly schema: Schema<Name>;
  private readonly prop: PivotProps<Name, Name>;

  private rowHeadersInternal!: DimensionValue[][];
  private columnHeadersInternal!: DimensionValue[][];
  private columnIndex!: number[][];
  private rowIndex!: number[][];

  constructor(schema: Schema<Name>, data: Matrix<any>, prop: PivotProps<Name, Name>) {
    this.schema = schema;
    this.data = data;
    this.prop = prop;
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
    this.buildIndex();
    const row = this.rowIndex[rowIdentifier];
    return new FragmentFrame(this.schema, this.data, row);
  }

  public column(columnIdentifier: number) {
    this.buildIndex();
    const column = this.columnIndex[columnIdentifier];
    return new FragmentFrame(this.schema, this.data, column);
  }

  public cell(rowIdentifier: number, columnIdentifier: number) {
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

    let maxColumnLength = 0;
    let maxRowLength = 0;

    const lastInRow = this.prop.rows.length - 1;
    const rowTreeIndex = {} as Record<DimensionValue, any>;
    const rows: DimensionValue[][] = [];
    const rowIndex: number[][] = [];

    const lastInColumn = this.prop.columns.length - 1;
    const columnTreeIndex = {} as Record<DimensionValue, any>;
    const columns: DimensionValue[][] = [];
    const columnIndex: number[][] = [];

    this.data.forEach((dataRow, rowNumber) => {
      const row: DimensionValue[] = [];
      let previousRow: Record<DimensionValue, any> = rowTreeIndex;

      this.prop.rows.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        row.push(dimensionValue);

        if (previousRow[dimensionValue] === undefined) {
          if (i === lastInRow) {
            rows.push(row);
            rowIndex[rows.length - 1] = previousRow[dimensionValue] = [];
          } else {
            previousRow[dimensionValue] = {};
          }
        }
        if (i === lastInRow) {
          previousRow[dimensionValue].push(rowNumber);
          maxRowLength = Math.max(previousRow[dimensionValue].length, maxRowLength);
        }
        previousRow = previousRow[dimensionValue];
      });

      const column: DimensionValue[] = [];
      let previousColumn: Record<DimensionValue, any> = columnTreeIndex;

      this.prop.columns.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        column.push(dimensionValue);
        if (previousColumn[dimensionValue] === undefined) {
          if (i === lastInColumn) {
            columns.push(column);
            columnIndex[columns.length - 1] = previousColumn[dimensionValue] = [];
          } else {
            previousColumn[dimensionValue] = {};
          }
        }
        if (i === lastInColumn) {
          previousColumn[dimensionValue].push(rowNumber);
          maxColumnLength = Math.max(previousColumn[dimensionValue].length, maxColumnLength);
        }
        previousColumn = previousColumn[dimensionValue];
      });
    });

    this.columnHeadersInternal =
      this.prop.columns.length === 0 ? Array.from({ length: maxRowLength }).map(_ => []) : columns;
    this.rowHeadersInternal = this.prop.rows.length === 0 ? Array.from({ length: maxColumnLength }).map(_ => []) : rows;

    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
  }
}
