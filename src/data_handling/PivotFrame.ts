import { FragmentFrame } from "./FragmentFrame";
import { Matrix, PivotProps, Schema } from "./types";

const intersect = <T>(...arr: T[][]): T[] => arr.reduce((prev, curr) => prev.filter(x => curr.includes(x)));

export class PivotFrame<Name extends string = string> {
  private readonly data: Matrix<any>;
  private readonly schema: Schema<Name>;
  private readonly prop: PivotProps<Name, Name>;

  private columnIndex!: Record<Name, any>;
  private rowIndex!: Record<Name, any>;
  private rowsCache!: Name[][];
  private columnsCache!: Name[][];

  constructor(schema: Schema<Name>, data: Matrix<any>, prop: PivotProps<Name, Name>) {
    this.schema = schema;
    this.data = data;
    this.prop = prop;
  }

  public rowsIndex() {
    this.buildIndex();
    return this.rowsCache;
  }

  public columnsIndex() {
    this.buildIndex();
    return this.columnsCache;
  }

  public row(rowIdentifier: Name[]) {
    this.buildIndex();
    let row = this.rowIndex;
    rowIdentifier.forEach(i => {
      row = row[i];
      if (row === undefined) {
        throw new Error(`no row for index: ${rowIdentifier}`);
      }
    });

    return new FragmentFrame(this.schema, this.data, row as number[]);
  }

  public column(columnIdentifier: Name[]) {
    this.buildIndex();
    let column = this.columnIndex;
    columnIdentifier.forEach(i => {
      column = column[i];
      if (column === undefined) {
        throw new Error(`no column for index: ${columnIdentifier}`);
      }
    });

    return new FragmentFrame(this.schema, this.data, column as number[]);
  }

  public cell(rowIdentifier: Name[], columnIdentifier: Name[]) {
    this.buildIndex();

    let row = this.rowIndex;
    rowIdentifier.forEach(i => {
      row = row[i];
      if (row === undefined) {
        throw new Error(`no row for index: ${rowIdentifier}`);
      }
    });

    let column = this.columnIndex;
    columnIdentifier.forEach(i => {
      column = column[i];
      if (column === undefined) {
        throw new Error(`no column for index: ${columnIdentifier}`);
      }
    });

    const cell = intersect(row as number[], column as number[]);
    return new FragmentFrame(this.schema, this.data, cell);
  }

  private buildIndex() {
    if (this.columnIndex) {
      return;
    }

    const nameToIndex = this.schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );

    const lastInRow = this.prop.rows.length - 1;
    const rowIndex = {} as Record<Name, any>;
    const rows: Name[][] = [];

    const lastInColumn = this.prop.columns.length - 1;
    const columnIndex = {} as Record<Name, any>;
    const columns: Name[][] = [];

    this.data.forEach((dataRow, rowNumber) => {
      const row: Name[] = [];
      let previousRow: any = rowIndex;

      this.prop.rows.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        row.push(dimensionValue);
        if (previousRow[dimensionValue] === undefined) {
          if (i === lastInRow) {
            previousRow[dimensionValue] = [];
            rows.push(row);
          } else {
            previousRow[dimensionValue] = {};
          }
        }
        if (i === lastInRow) {
          previousRow[dimensionValue].push(rowNumber);
        }
        previousRow = previousRow[dimensionValue];
      });

      const column: Name[] = [];
      let previousColumn: any = columnIndex;

      this.prop.columns.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        column.push(dimensionValue);
        if (previousColumn[dimensionValue] === undefined) {
          if (i === lastInColumn) {
            previousColumn[dimensionValue] = [];
            columns.push(column);
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

    this.columnsCache = columns;
    this.rowsCache = rows;
    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
  }
}
