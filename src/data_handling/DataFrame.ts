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

  public groupBy<Column extends Name, NewColumn extends string>(
    columns: Column[],
    newColumn: NewColumn = "aggregate" as NewColumn,
  ) {
    // should return GroupedDataFrame<Name - typeof columns + NewColumn>
    // new column type is DataFrame<typeof columns>
    // return new GroupedDataFrame(this.schema, this.data);
    throw new Error("not implemented");
  }

  public transform(column: Name, cb: (columnValue: any) => any) {
    throw new Error("not implemented");
  }

  public pivot<Column extends Name, Row extends Name, Cell extends Name>(prop: PivotProps<Column, Row, Cell>) {
    // return new PivotedDataFrame(this.schema, this.data);

    const lastInRow = "rowsMeasures" in prop ? prop.rows.length : prop.rows.length - 1;
    const lastInColumn = "columnsMeasures" in prop ? prop.columns.length : prop.columns.length - 1;
    let columnCounter = 0;
    let rowCounter = 0;
    const columnIndex: any = {};
    const rowIndex: any = {};
    const columns: string[][] = [];
    const rows: string[][] = [];
    const resultData: any[][] = [];

    const nameToIndex = this.schema.reduce(
      (acc, columnDefinition, index) => {
        acc[columnDefinition.name] = index;
        return acc;
      },
      {} as Record<Name, number>,
    );

    this.data.forEach(dataRow => {
      let previousRow: any = rowIndex;
      let previousColumn: any = columnIndex;

      let currentRow: number = -1;
      let currentColumn: number = -1;

      const row: string[] = [];
      const column: string[] = [];

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
