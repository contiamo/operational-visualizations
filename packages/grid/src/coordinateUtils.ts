import { PivotFrame } from "@operational/frame";
import { CellCoordinates, DimensionLabels, HeightParam, WidthParam } from "./types";

export const exhaustiveCheck = (_: never) => undefined;

export type IndexToCoordinate = <Name extends string = string>(prop: {
  rowHeadersCount: number;
  columnHeadersCount: number;
  rowMeasures: Name[];
  columnMeasures: Name[];
  data: PivotFrame<Name>;
  axes: {
    // we don't care about exact types, we care if render props are present or not
    // tslint:disable-next-line
    row?: Function;
    // tslint:disable-next-line
    column?: Function;
  };
  dimensionLabels: DimensionLabels;
}) => (prop: { columnIndex: number; rowIndex: number }) => CellCoordinates<Name>;

// tslint:disable
/**
 * We use virtual scrolling in the Grid, so we need to be able to tell the size of each cell in the grid.
 * We decided to treat all type of cells as if they are in one big grid, including cells with headers, axes, measure names, values.
 * This function takes index coordinates in the "big grid" (x, y) and converts it to specific type of cells, 
 * for example `{ type: Empty }`, `{ type: Cell }`... so we would be able to pattern match against type 
 * and render appropriate cell or tell the dimension of the cell.
 * Cells are positioned this way in the "big grid":
 *```
                                  ColumnHeader
                                   +
          +--------------------+   |
Empty --->+            |Columns+<--+
          |            |       |   |
          |            |       |   |
          |            |       |   |
          |            |       |   |
          |            +-------+   |
          |            |Measure+<--+
          |            +-------+
          |            |Axis   +<--+ColumnAxis
          +--------------------+
          |Rows    |M|A|Cells  +<--+Cell
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          ++-------+++++-------+
           ^        ^ ^
           |        | |
RowHeader -+--------+ |
                      |
RowAxis --------------+
```
 */
export const indexToCoordinate: IndexToCoordinate = ({
  // tslint:enable
  rowHeadersCount,
  columnHeadersCount,
  data,
  axes,
  rowMeasures,
  columnMeasures,
  dimensionLabels,
}) => ({ columnIndex, rowIndex }) => {
  const rowMeasuresCount = rowMeasures.length;
  const columnMeasuresCount = columnMeasures.length;

  const columnIndexReal = Math.floor((columnIndex - rowHeadersCount) / (columnMeasuresCount || 1));
  const rowIndexReal = Math.floor((rowIndex - columnHeadersCount) / (rowMeasuresCount || 1));
  const columnMeasuresIndex = (columnIndex - rowHeadersCount) % (columnMeasuresCount || 1);
  const rowMeasuresIndex = (rowIndex - columnHeadersCount) % (rowMeasuresCount || 1);

  /** column headers, columns measures, column axis */
  const isRowHeaders = columnIndex < rowHeadersCount;
  /** row headers, columns measures, column axis */
  const isColumnHeaders = rowIndex < columnHeadersCount;
  /** top left zone with empty cells */
  const isEmpty = isRowHeaders && isColumnHeaders;

  if (isEmpty) {
    // if we place column labels on the left and this is column right before columns headers
    if (dimensionLabels.column === "left" && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        columnIndex: rowIndex,
        dimensionLabel: data.getPivotColumns()[rowIndex] || "",
      };
    }

    // if we place row labels at the top and this is row right above row headers
    if (dimensionLabels.row === "top" && rowIndex === columnHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        columnIndex: rowIndex,
        dimensionLabel: data.getPivotRows()[columnIndex] || "",
      };
    }

    // if this the row with column measure
    if (
      // show measures in column headers
      rowMeasuresCount > 1 &&
      // and we are in the row exactly above data cells or exactly above axes
      rowIndex === columnHeadersCount - 1 - (axes.column ? 1 : 0)
    ) {
      // if this is a cell with row axis
      if (axes.row && columnIndex === rowHeadersCount - 1) {
        return {
          type: "Empty",
          measure: true,
          axis: true,
        };
      } else {
        return {
          type: "Empty",
          measure: true,
        };
      }
    }

    if (
      // show measures in row headers
      columnMeasuresCount > 1 &&
      // and we are in the column exactly before data cells or exactly before axes
      columnIndex === rowHeadersCount - 1 - (axes.row ? 1 : 0)
    ) {
      // if this is a cell with column axis
      if (axes.column && rowIndex === columnHeadersCount - 1) {
        return {
          type: "Empty",
          measure: true,
          axis: true,
        };
      } else {
        return {
          type: "Empty",
          measure: true,
        };
      }
    }
    // if we are in the cell with row axis in it and column axis in it
    if (axes.column && rowIndex === columnHeadersCount - 1 && axes.row && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        axis: true,
      };
    }
    // if we are in the column with row axis in it
    if (axes.row && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        columnIndex: rowIndex,
        axis: true,
      };
    }
    // if we are in the row with column axis in it
    if (axes.column && rowIndex === columnHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        axis: true,
      };
    }
    // other empty cells
    return {
      type: "Empty",
      rowIndex: columnIndex,
      columnIndex: rowIndex,
    };
  } else if (isRowHeaders) {
    const rowDimensionLabelsOnLeft = dimensionLabels.row === "left";
    const rowDepth = rowDimensionLabelsOnLeft ? Math.floor(columnIndex / 2) : columnIndex;
    const dimension = data.rowHeaders().length > 0 ? data.rowHeaders()[rowIndexReal][rowDepth] : undefined;

    if (
      // do we show row dimensions on the left
      rowDimensionLabelsOnLeft &&
      // and this is even column (0, 2, 4)
      columnIndex % 2 === 0 &&
      // and there is dimension value
      dimension !== undefined
    ) {
      return {
        type: "RowHeader",
        row: rowIndexReal,
        measure: data.getPivotRows()[rowDepth],
        empty: rowIndexReal > 0 || rowMeasuresIndex > 0,
      };
    }

    const prevRow = data.rowHeaders()[rowIndexReal - 1];
    // there is no dimnsion so it should be cell with measure or axis
    if (dimension === undefined) {
      // are we in column with row axis
      if (axes.row && rowDepth === rowHeadersCount - 1) {
        return {
          type: "RowAxis",
          row: rowIndexReal,
          measure: rowMeasures[rowMeasuresIndex],
        };
      } else {
        // or with measure labels
        return {
          type: "RowHeader",
          row: rowIndexReal,
          measure: rowMeasures[rowMeasuresIndex],
        };
      }
    } else {
      return {
        type: "RowHeader",
        row: rowIndexReal,
        label: data.rowHeaders()[rowIndexReal][rowDepth],
        measure: rowMeasures[rowMeasuresIndex],
        rowIndex: rowDepth,
        empty: (prevRow && prevRow[rowDepth] === dimension) || columnMeasuresIndex > 0,
      };
    }
  } else if (isColumnHeaders) {
    const columnDimensionLabelsAbove = dimensionLabels.column === "top";
    const columnDepth = columnDimensionLabelsAbove ? Math.floor(rowIndex / 2) : rowIndex;
    const dimension = data.columnHeaders().length > 0 ? data.columnHeaders()[columnIndexReal][columnDepth] : undefined;

    if (
      // do we show column label on the top
      columnDimensionLabelsAbove &&
      // and this is even row (0, 2, 4)
      rowIndex % 2 === 0 &&
      // and there is dimension value
      dimension !== undefined
    ) {
      return {
        type: "ColumnHeader",
        column: columnIndexReal,
        measure: data.getPivotColumns()[columnDepth],
        empty: columnIndexReal > 0 || columnMeasuresIndex > 0,
      };
    }

    const prevColumn = data.columnHeaders()[columnIndexReal - 1];
    // there is no dimnsion so it should be cell with measure or axis
    if (dimension === undefined) {
      // are we in row with column axis
      if (axes.column && columnDepth === columnHeadersCount - 1) {
        return {
          type: "ColumnAxis",
          column: columnIndexReal,
          measure: columnMeasures[columnMeasuresIndex],
        };
      } else {
        // or with measure labels
        return {
          type: "ColumnHeader",
          x: 1,
          column: columnIndexReal,
          measure: columnMeasures[columnMeasuresIndex],
        };
      }
    } else {
      return {
        type: "ColumnHeader",
        column: columnIndexReal,
        label: data.columnHeaders()[columnIndexReal][columnDepth],
        measure: columnMeasures[columnMeasuresIndex],
        columnIndex: columnDepth,
        empty: (prevColumn && prevColumn[columnDepth] === dimension) || rowMeasuresIndex > 0,
      };
    }
  } else {
    return {
      type: "Cell",
      row: rowIndexReal,
      column: columnIndexReal,
      rowMeasure: rowMeasures[rowMeasuresIndex],
      columnMeasure: columnMeasures[columnMeasuresIndex],
    };
  }
};

// Those functions (coordinateToWidthParam, coordinateToHeightParam) take into account 16 use cases
// but for detecting width and Height we need only 8 use cases (4 for rows and 4 columns)

export const coordinateToWidthParam = <Name extends string = string>(prop: CellCoordinates<Name>): WidthParam<Name> => {
  switch (prop.type) {
    case "Empty":
      if (prop.measure && prop.rowIndex === undefined) {
        return {
          type: "RowMeasure",
        };
      } else if (prop.axis && prop.rowIndex === undefined) {
        return {
          type: "RowAxis",
        };
      } else {
        return {
          type: "RowHeader",
          rowIndex: prop.rowIndex!,
        };
      }
    case "Cell":
      return {
        type: "Cell",
        column: prop.column,
        columnMeasure: prop.columnMeasure,
        rowMeasure: prop.rowMeasure,
      };
    case "ColumnAxis":
    case "ColumnHeader":
      return {
        type: "Cell",
        column: prop.column,
        columnMeasure: prop.measure,
      };
    case "RowAxis":
      return {
        type: "RowAxis",
      };
    case "RowHeader":
      if (prop.rowIndex !== undefined) {
        return {
          type: "RowHeader",
          rowIndex: prop.rowIndex,
        };
      } else {
        return {
          type: "RowMeasure",
        };
      }
    default:
      exhaustiveCheck(prop);
      throw new Error("Not exhaustive");
  }
};

export const coordinateToHeightParam = <Name extends string = string>(
  prop: CellCoordinates<Name>,
): HeightParam<Name> => {
  switch (prop.type) {
    case "Empty":
      if (prop.measure && prop.columnIndex === undefined) {
        return {
          type: "ColumnMeasure",
        };
      } else if (prop.axis && prop.columnIndex === undefined) {
        return {
          type: "ColumnAxis",
        };
      } else {
        return {
          type: "ColumnHeader",
          columnIndex: prop.columnIndex!,
        };
      }
    case "Cell":
      return {
        type: "Cell",
        row: prop.row,
        columnMeasure: prop.columnMeasure,
        rowMeasure: prop.rowMeasure,
      };
    case "RowAxis":
    case "RowHeader":
      return {
        type: "Cell",
        row: prop.row,
        rowMeasure: prop.measure,
      };
    case "ColumnAxis":
      return {
        type: "ColumnAxis",
      };
    case "ColumnHeader":
      if (prop.columnIndex !== undefined) {
        return {
          type: "ColumnHeader",
          columnIndex: prop.columnIndex,
        };
      } else {
        return {
          type: "ColumnMeasure",
        };
      }
    default:
      exhaustiveCheck(prop);
      throw new Error("Not exhaustive");
  }
};

/**
 * Get number of slots required to show row headers, including row labels, row values, measure labels and axis
 */
export const getRowHeadersCount = <Name extends string = string>({
  axes,
  data,
  dimensionLabels,
  rowMeasuresCount,
}: {
  axes: {
    // we don't care about exact types, we care if render props are present or not
    // tslint:disable-next-line
    row?: Function;
    // tslint:disable-next-line
    column?: Function;
  };
  data: PivotFrame<Name>;
  dimensionLabels: DimensionLabels;
  rowMeasuresCount: number;
  columnMeasuresCount: number;
}) => {
  const rowsDepth = data.getPivotRows().length;
  let rowHeadersCount =
    // if we place labels on the left in rows we need to double number of slots
    // because it will look like: labelA | valueA | labelB | valueB
    rowsDepth * (dimensionLabels.row === "left" ? 2 : 1) +
    // if we show measure labels and there is more than one measure add one slot for it
    (rowMeasuresCount > 1 ? 1 : 0) +
    // add one slot for axes
    (axes.row ? 1 : 0);

  // if we don't have rowHeaders slots and we show labels for columns on the left
  // we need to add one slot for it
  if (rowHeadersCount === 0 && dimensionLabels.column === "left") {
    rowHeadersCount = 1;
  }
  return rowHeadersCount;
};

/**
 * Get number of slots required to show column headers, including column labels, column values, measure labels and axis
 */
export const getColumnHeadersCount = <Name extends string = string>({
  axes,
  data,
  dimensionLabels,
  columnMeasuresCount,
}: {
  axes: {
    // we don't care about exact types, we care if render props are present or not
    // tslint:disable-next-line
    row?: Function;
    // tslint:disable-next-line
    column?: Function;
  };
  data: PivotFrame<Name>;
  dimensionLabels: DimensionLabels;
  rowMeasuresCount: number;
  columnMeasuresCount: number;
}) => {
  const columnDepth = data.getPivotColumns().length;
  // see getRowHeadersCount for explanation
  let columnHeadersCount =
    columnDepth * (dimensionLabels.column === "top" ? 2 : 1) +
    (columnMeasuresCount > 1 ? 1 : 0) +
    (axes.column ? 1 : 0);

  if (columnHeadersCount === 0 && dimensionLabels.row === "top") {
    columnHeadersCount = 1;
  }
  return columnHeadersCount;
};

/**
 * Get total number of row slots required to show the grid e.g. number of headers + number of data cells
 * if we show measure labels in columns we need to increase number of data cell by number of measures
 */
export const getColumnCount = <Name extends string = string>({
  rowHeadersCount,
  data,
  columnMeasuresCount,
}: {
  data: PivotFrame<Name>;
  rowHeadersCount: number;
  rowMeasuresCount: number;
  columnMeasuresCount: number;
}) => {
  if (data.columnHeaders().length === 0) {
    return rowHeadersCount + (columnMeasuresCount || 1);
  } else {
    return rowHeadersCount + data.columnHeaders().length * (columnMeasuresCount || 1);
  }
};

/**
 * Get total number of column slots required to show the grid e.g. number of headers + number of data cells
 * if we show measure labels in rows we need to increase number of data cell by number of measures
 */
export const getRowCount = <Name extends string = string>({
  columnHeadersCount,
  data,
  rowMeasuresCount,
}: {
  data: PivotFrame<Name>;
  columnHeadersCount: number;
  rowMeasuresCount: number;
  columnMeasuresCount: number;
}) => {
  if (data.rowHeaders().length === 0) {
    return columnHeadersCount + (rowMeasuresCount || 1);
  } else {
    return columnHeadersCount + data.rowHeaders().length * (rowMeasuresCount || 1);
  }
};
