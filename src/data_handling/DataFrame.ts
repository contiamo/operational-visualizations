/**
 * TODO:
 * - add tests
 * - consider implementing lazy versions of pivot and groupBy
 * - see if we can improve static types
 */
import { RawDataset } from "./multidimensional_dataset";
import { PivotFrame } from "./PivotFrame";
import { IteratableFrame, Matrix, MddPivotProps, PivotProps, Schema } from "./types";

const immutableReplace = <T>(arr: T[], index: number, val: T) => {
  if (index < arr.length && index >= 0) {
    return [...arr.slice(0, index), val, ...arr.slice(index + 1)];
  } else {
    throw new Error("Out of bound");
  }
};

export default class DataFrame<Name extends string = string> implements IteratableFrame<Name> {
  private readonly data: Readonly<Matrix<any>>;
  public readonly schema: Readonly<Schema<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
  }

  /**
   * mdd stands for MultidimensionalDataset. This function meant to be used with MultidimensionalDataset.
   *
   * current implementation doesn't take columnsMeasures/rowsMeasures into account,
   * which is fine if we have one measure with one value,
   * e.g. if we use like this .groupBy([a, b], c).mdd({rows: [a], columns: [b], columnsMeasures: [c] })
   * but this is wrong in general case
   */
  public mdd<Column extends Name, Row extends Name, Cell extends Name>(prop: MddPivotProps<Column, Row, Cell>) {
    // check if the input params are valid
    const rowDimensions = "rowsMeasures" in prop ? prop.rows.length + prop.rowsMeasures.length : prop.rows.length;
    const columnDimensions =
      "columnsMeasures" in prop ? prop.columns.length + prop.columnsMeasures.length : prop.columns.length;
    if (rowDimensions === 0) {
      throw new Error("Please provide at least one row or rowDimension");
    }
    if (columnDimensions === 0) {
      throw new Error("Please provide at least one column or columnDimension");
    }

    // actual code
    const nameToIndex = this.schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );

    const lastInRow = "rowsMeasures" in prop ? prop.rows.length : prop.rows.length - 1;
    const rowIndex: any = {};
    const rows: string[][] = [];
    let rowCounter = 0;

    const lastInColumn = "columnsMeasures" in prop ? prop.columns.length : prop.columns.length - 1;
    const columnIndex: any = {};
    const columns: string[][] = [];
    let columnCounter = 0;

    const resultData: any[][] = [];

    this.data.forEach(dataRow => {
      const row: string[] = [];
      let previousRow: any = rowIndex;
      let currentRow: number = -1;

      prop.rows.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        row.push(dimensionValue);
        if (previousRow[dimensionValue] === undefined) {
          if (i === lastInRow) {
            previousRow[dimensionValue] = rowCounter;
            rowCounter++;
            rows.push(row);
          } else {
            previousRow[dimensionValue] = {};
          }
        }
        if (i === lastInRow) {
          currentRow = previousRow[dimensionValue];
        }
        previousRow = previousRow[dimensionValue];
      });

      const column: string[] = [];
      let previousColumn: any = columnIndex;
      let currentColumn: number = -1;

      prop.columns.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        column.push(dimensionValue);
        if (previousColumn[dimensionValue] === undefined) {
          if (i === lastInColumn) {
            previousColumn[dimensionValue] = columnCounter;
            columnCounter++;
            columns.push(column);
          } else {
            previousColumn[dimensionValue] = {};
          }
        }
        if (i === lastInColumn) {
          currentColumn = previousColumn[dimensionValue];
        }
        previousColumn = previousColumn[dimensionValue];
      });

      if ("rowsMeasures" in prop) {
        prop.rowsMeasures.forEach(measure => {
          if (previousRow[measure] === undefined) {
            previousRow[measure] = rowCounter;
            rowCounter++;
            rows.push(row);
          }
          currentRow = previousRow[measure];
          if (resultData[currentRow] === undefined) {
            resultData[currentRow] = [];
          }
          if (resultData[currentRow][currentColumn] !== undefined) {
            throw new Error(`Duplicate values for "${[...row, ...column]}...". Use groupBy to collapse duplicates.`);
          }
          resultData[currentRow][currentColumn] = dataRow[nameToIndex[measure]];
        });
      } else {
        prop.columnsMeasures.forEach(measure => {
          if (previousColumn[measure] === undefined) {
            previousColumn[measure] = columnCounter;
            columnCounter++;
            columns.push(column);
          }
          currentColumn = previousColumn[measure];
          if (resultData[currentRow] === undefined) {
            resultData[currentRow] = [];
          }
          if (resultData[currentRow][currentColumn] !== undefined) {
            throw new Error(`Duplicate values for "${[...row, ...column]}...". Use groupBy to collapse duplicates.`);
          }
          resultData[currentRow][currentColumn] = dataRow[nameToIndex[measure]];
        });
      }
    });

    return {
      data: resultData,
      columns,
      rows,
      rowDimensions: prop.rows.map(dimension => {
        const schema = this.schema.find(schemaDimesion => schemaDimesion.name === dimension)!;
        return {
          key: schema.name,
          type: schema.type,
        };
      }),
      columnDimensions: prop.columns.map(dimension => {
        const schema = this.schema.find(schemaDimesion => schemaDimesion.name === dimension)!;
        return {
          key: schema.name,
          type: schema.type,
        };
      }),
    } as RawDataset<any>;
  }

  public groupBy<Column extends Name, NewColumn extends string>(
    columns: Column[],
    newColumn: NewColumn = "aggregate" as NewColumn,
  ) {
    // check if the input params are valid
    if (columns.length < 1) {
      throw new Error("Please provide at least one column to group by");
    }
    if (columns.includes(newColumn as any)) {
      throw new Error(`There is duplicate name in columns and newColumn: ${newColumn}`);
    }
    const flattenSchema = this.schema.map(x => x.name);
    const unknownColumn = columns.find(x => !flattenSchema.includes(x));
    if (unknownColumn) {
      throw new Error(`Unknown column ${unknownColumn}`);
    }

    // actual code
    const restOfColumns = this.schema.filter(schemaColumn => !columns.includes(schemaColumn.name as any));
    // : Schema<Column | NewColumn>
    const newSchema = this.schema.filter(schemaColumn => columns.includes(schemaColumn.name as any));
    newSchema.push({
      name: newColumn as any,
      type: `DataFrame<${JSON.stringify(restOfColumns)
        .replace(/"/g, "")
        .replace(/,/g, ", ")}>`,
    });

    let rowCounter = 0;
    const resultData: any[][] = [];
    const lastInRow = columns.length - 1;

    const nameToIndex = this.schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );
    const rowIndex: any = {};

    this.data.forEach(dataRow => {
      const row: any[] = [];
      let previousRow: any = rowIndex;
      let currentRow = -1;

      columns.forEach((dimension, i) => {
        const dimensionValue = dataRow[nameToIndex[dimension]];
        row.push(dimensionValue);
        if (previousRow[dimensionValue] === undefined) {
          if (i === lastInRow) {
            previousRow[dimensionValue] = rowCounter;
            rowCounter++;
            row.push([]);
            resultData.push(row);
          } else {
            previousRow[dimensionValue] = {};
          }
        }
        if (i === lastInRow) {
          currentRow = previousRow[dimensionValue];
        }
        previousRow = previousRow[dimensionValue];
      });

      resultData[currentRow][lastInRow + 1].push(
        restOfColumns.map(schemaColumn => dataRow[nameToIndex[schemaColumn.name]]),
      );
    });

    resultData.forEach((row, i) => {
      resultData[i][lastInRow + 1] = new DataFrame(restOfColumns, row[lastInRow + 1]);
    });

    return new DataFrame(newSchema, resultData);
  }

  public transform(column: Name, cb: (columnValue: any) => any, newType: any = null) {
    const columnIndex = this.schema.findIndex(x => x.name === column);
    if (columnIndex < 0) {
      throw new Error(`Unknown column ${column}`);
    }

    const newSchema = immutableReplace(this.schema, columnIndex, {
      name: column,
      type: newType || this.schema[columnIndex].type,
    });

    // column oriented implementation for this function would be way better
    return new DataFrame(
      newSchema,
      this.data.map(dataRow => {
        const x = immutableReplace(dataRow, columnIndex, cb(dataRow[columnIndex]));
        return x;
      }),
    );
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

  // we need this function for semiotic
  public toRecordList() {
    const columns = this.schema.map(x => x.name);
    return this.data.map(dataRow =>
      columns.reduce(
        (result, column, i) => {
          result[column] = dataRow[i];
          return result;
        },
        {} as Record<Name, any>,
      ),
    );
  }

  // TODO add explanation
  public pivot<Column extends Name, Row extends Name>(prop: PivotProps<Column, Row>) {
    // check if the input params are valid
    const rowDimensions = prop.rows.length;
    const columnDimensions = prop.columns.length;
    if (rowDimensions === 0) {
      throw new Error("Please provide at least one row or rowDimension");
    }
    if (columnDimensions === 0) {
      throw new Error("Please provide at least one column or columnDimension");
    }
    return new PivotFrame(this.schema, this.data, prop);
  }
}
