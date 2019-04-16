import MultidimensionalDataset, { RawDataset } from "./multidimensional_dataset";

// most likely we will get data in the following format
// where type can be number/string/boolean
const rawData = {
  columns: [
    { name: "Date.Month" as "Date.Month", type: "string" },
    { name: "Customer.country" as "Customer.country", type: "string" },
    { name: "Customer.province" as "Customer.province", type: "string" },
    { name: "cost" as "cost", type: "number" },
  ],
  rows: [
    ["April", "Canada", "BC", 3398.3977],
    ["April", "Mexico", "DF", 2633.8854],
    ["April", "Mexico", "Guerrero", 1084.7106],
    ["April", "Mexico", "Jalisco", 108.2924],
    ["April", "Mexico", "Mexico", 777.3468],
    ["April", "Mexico", "Sinaloa", 743.2736],
    ["April", "Mexico", "Veracruz", 1398.1592],
    ["April", "Mexico", "Yucatan", 2474.3939],
    ["April", "Mexico", "Zacatecas", 5856.6422],
    ["April", "USA", "CA", 4868.3913],
  ],
};

// task:
// 1. convert this representation to pivot table (multi-index), so we can support simple table for the Grid: groupBy -> pivot -> transform
// 2. conver this representation to the form suitable for the visualisation src/website/TestCases/Grid/table-4.tsx: groupBy -> pivot -> transform(toObjectList)

const immutableSet = <T>(arr: T[], index: number, val: T) => {
  if (index < arr.length) {
    return [...arr.slice(0, index), val, ...arr.slice(index + 1)];
  } else {
    throw new Error("Out of bound");
  }
};

type Matrix<T> = T[][];

type Schema<Name extends string> = Array<{ name: Name; type?: any }>;

/**
 * We call third type Measure by tradition, in Pandas this valie is indeed measure - something numeric,
 * but in our case this can be a column with DataFrame (after groupBy).
 * Measure is what goes inside of cells in Pivot table.
 * If we have more than one Measure, names of measures will "form a virtual dimension".
 * Because of the way how Pivot table is constructed measures can go either to rows or to columns, not in both.
 *
 * +----------------+
 * |      | Columns |
 * +----------------+
 * | Rows | Measure |
 * +----------------+
 */
type PivotProps<Column, Row, Measure> =
  | {
      rows: Row[];
      columns: Column[];
      rowsMeasures: Measure[];
    }
  | {
      rows: Row[];
      columns: Column[];
      columnsMeasures: Measure[];
    };

class DataFrame<Name extends string = any> {
  private readonly data: Readonly<Matrix<any>>;
  private readonly schema: Readonly<Schema<Name>>;

  constructor(schema: Schema<Name>, data: Matrix<any>) {
    this.schema = schema;
    this.data = data;
  }

  public pivot<Column extends Name, Row extends Name, Cell extends Name>(prop: PivotProps<Column, Row, Cell>) {
    // return new PivotedDataFrame(this.schema, this.data);

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
            row.push(measure);
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
            column.push(measure);
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
      rowDimensions: [...prop.rows, ...("rowsMeasures" in prop ? ["measure"] : [])].map(dimension => {
        const schema = this.schema.find(schemaDimesion => schemaDimesion.name === dimension) || {
          name: dimension,
          type: "string",
        };
        return {
          key: schema.name,
          type: schema.type,
        };
      }),
      columnDimensions: [...prop.columns, ...("columnsMeasures" in prop ? ["measure"] : [])].map(dimension => {
        const schema = this.schema.find(schemaDimesion => schemaDimesion.name === dimension) || {
          name: dimension,
          type: "string",
        };
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
    // should return GroupedDataFrame<Name - typeof columns + NewColumn>
    // new column type is DataFrame<typeof columns>
    // return new GroupedDataFrame(this.schema, this.data);

    // check if the input params are valid
    if (columns.length < 1) {
      throw new Error("Please provide at least one column to group by");
    }
    if (columns.includes(newColumn as any)) {
      throw new Error(`There is duplicate name in columns and newColumn: ${newColumn}`);
    }
    const falttenSchema = this.schema.map(x => x.name);
    const unkonwnColumn = columns.find(x => !falttenSchema.includes(x));
    if (unkonwnColumn) {
      throw new Error(`Unknown column ${unkonwnColumn}`);
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

    const newSchema = immutableSet(this.schema, columnIndex, {
      name: column,
      type: newType || this.schema[columnIndex].type,
    });

    // column oriented implementation for this function would be way better
    return new DataFrame(
      newSchema,
      this.data.map(dataRow => immutableSet(dataRow, columnIndex, cb(dataRow[columnIndex]))),
    );
  }
}

// Lazyly evaluates group by
// class GroupedDataFrame extends DataFrame {}

// Lazyly evaluates pivot
// class PivotedDataFrame extends DataFrame {}

export const frame = new DataFrame(rawData.columns, rawData.rows);

// const result = frame.pivot({
//   columns: ["Date.Month"],
//   rows: ["Customer.country", "Customer.province"],
//   columnsMeasures: ["cost"],
// });

// console.log(new MultidimensionalDataset(result));

// console.log(JSON.stringify(frame.groupBy(["Customer.country"]), null, 2));
