import { PivotFrame } from "../DataFrame/PivotFrame";
import { CellCoordinates, DimensionLabels, HeightParam, WidthParam } from "./types";

export const exhaustiveCheck = (_: never) => undefined;

export type IndexToCoordinate = <Name extends string = string>(
  prop: {
    rowHeadersCount: number;
    measuresPlacement: "row" | "column";
    columnHeadersCount: number;
    measuresMultiplier: number;
    data: PivotFrame<Name>;
    axes: {
      // we don't care about exact types, we care if render props are present or not
      // tslint:disable-next-line
      row?: Function;
      // tslint:disable-next-line
      column?: Function;
    };
    measures: Name[];
    dimensionLabels: DimensionLabels;
  },
) => (prop: { columnIndex: number; rowIndex: number }) => CellCoordinates<Name>;

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
  measuresPlacement,
  columnHeadersCount,
  measuresMultiplier,
  data,
  axes,
  measures,
  dimensionLabels,
}) => ({ columnIndex, rowIndex }) => {
  const columnIndexReal = Math.floor(
    (columnIndex - rowHeadersCount) / (measuresPlacement === "column" ? measuresMultiplier : 1),
  );
  const rowIndexReal = Math.floor(
    (rowIndex - columnHeadersCount) / (measuresPlacement === "row" ? measuresMultiplier : 1),
  );
  const measuresIndex =
    (measuresPlacement === "column" ? columnIndex - rowHeadersCount : rowIndex - columnHeadersCount) %
    measuresMultiplier;

  /** column headers, columns measures, column axis */
  const isRowHeaders = columnIndex < rowHeadersCount;
  /** row headers, columns measures, column axis */
  const isColumnHeaders = rowIndex < columnHeadersCount;
  const isEmpty = isRowHeaders && isColumnHeaders;

  if (isEmpty) {
    if (dimensionLabels.column === "left" && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        columnIndex: rowIndex,
        dimensionLabel: data.getPivotColumns()[rowIndex] || "",
      };
    }

    if (dimensionLabels.row === "top" && rowIndex === columnHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        columnIndex: rowIndex,
        dimensionLabel: data.getPivotRows()[columnIndex] || "",
      };
    }

    if (
      measuresPlacement === "column" &&
      measuresMultiplier > 1 &&
      (axes.column ? rowIndex === columnHeadersCount - 2 : rowIndex === columnHeadersCount - 1)
    ) {
      if (axes.row && columnIndex === rowHeadersCount - 1) {
        return {
          type: "Empty",
          measure: "column",
          axis: true,
        };
      } else {
        return {
          type: "Empty",
          measure: "column",
        };
      }
    }
    if (
      measuresPlacement === "row" &&
      measuresMultiplier > 1 &&
      (axes.row ? columnIndex === rowHeadersCount - 2 : columnIndex === rowHeadersCount - 1)
    ) {
      if (axes.column && rowIndex === columnHeadersCount - 1) {
        return {
          type: "Empty",
          measure: "row",
          axis: true,
        };
      } else {
        return {
          type: "Empty",
          measure: "row",
        };
      }
    }
    if (axes.row && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        columnIndex: rowIndex,
        axis: true,
      };
    }
    if (axes.column && rowIndex === columnHeadersCount - 1) {
      return {
        type: "Empty",
        rowIndex: columnIndex,
        axis: true,
      };
    }
    if (axes.column && rowIndex === columnHeadersCount - 1 && axes.row && columnIndex === rowHeadersCount - 1) {
      return {
        type: "Empty",
        axis: true,
      };
    }

    return {
      type: "Empty",
      rowIndex: columnIndex,
      columnIndex: rowIndex,
    };
  } else if (isRowHeaders) {
    const rowDimensionLabelsOnLeft = dimensionLabels.row === "left";
    const rowDepth = rowDimensionLabelsOnLeft ? Math.floor(columnIndex / 2) : columnIndex;
    const dimension = data.rowHeaders()[rowIndexReal][rowDepth];

    const showDimensionLabel = rowDimensionLabelsOnLeft && columnIndex % 2 === 0;
    if (showDimensionLabel && dimension !== undefined) {
      return {
        type: "RowHeader",
        row: data.rowHeaders()[rowIndexReal],
        measure: data.getPivotRows()[rowDepth],
        empty: rowIndexReal > 0 || measuresIndex > 0,
      };
    }

    const prevRow = data.rowHeaders()[rowIndexReal - 1];
    if (dimension === undefined) {
      if (axes.row && rowDepth === rowHeadersCount - 1) {
        return {
          type: "RowAxis",
          row: data.rowHeaders()[rowIndexReal],
          measure: measures[measuresIndex],
        };
      } else {
        // measure dimension
        return {
          type: "RowHeader",
          row: data.rowHeaders()[rowIndexReal],
          measure: measures[measuresIndex],
        };
      }
    } else {
      return {
        type: "RowHeader",
        row: data.rowHeaders()[rowIndexReal],
        measure: measures[measuresIndex],
        rowIndex: rowDepth,
        empty: (prevRow && prevRow[rowDepth] === dimension) || (measuresIndex > 0 && measuresPlacement === "row"),
      };
    }
  } else if (isColumnHeaders) {
    const columnDimensionLabelsAbove = dimensionLabels.column === "top";
    const columnDepth = columnDimensionLabelsAbove ? Math.floor(rowIndex / 2) : rowIndex;
    const dimension = data.columnHeaders()[columnIndexReal][columnDepth];

    const showDimensionLabel = columnDimensionLabelsAbove && rowIndex % 2 === 0;
    if (showDimensionLabel && dimension !== undefined) {
      return {
        type: "ColumnHeader",
        column: data.columnHeaders()[columnIndexReal],
        measure: data.getPivotColumns()[columnDepth],
        empty: columnIndexReal > 0 || measuresIndex > 0,
      };
    }

    const prevColumn = data.columnHeaders()[columnIndexReal - 1];
    if (dimension === undefined) {
      if (axes.column && columnDepth === columnHeadersCount - 1) {
        return {
          type: "ColumnAxis",
          column: data.columnHeaders()[columnIndexReal],
          measure: measures[measuresIndex],
        };
      } else {
        // measure dimension
        return {
          type: "ColumnHeader",
          column: data.columnHeaders()[columnIndexReal],
          measure: measures[measuresIndex],
        };
      }
    } else {
      return {
        type: "ColumnHeader",
        column: data.columnHeaders()[columnIndexReal],
        measure: measures[measuresIndex],
        columnIndex: columnDepth,
        empty:
          (prevColumn && prevColumn[columnDepth] === dimension) ||
          (measuresIndex > 0 && measuresPlacement === "column"),
      };
    }
  } else {
    return {
      type: "Cell",
      rowIndex: rowIndexReal,
      columnIndex: columnIndexReal,
      row: data.rowHeaders()[rowIndexReal],
      column: data.columnHeaders()[columnIndexReal],
      measure: measures[measuresIndex],
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
          measure: true,
        };
      } else if (prop.axis && prop.rowIndex === undefined) {
        return {
          axis: true,
        };
      } else {
        return {
          rowIndex: prop.rowIndex!,
        };
      }
    case "Cell":
    case "ColumnAxis":
    case "ColumnHeader":
      return {
        column: prop.column,
        measure: prop.measure,
      };
    case "RowAxis":
      return {
        axis: true,
      };
    case "RowHeader":
      if (prop.rowIndex) {
        return {
          rowIndex: prop.rowIndex,
        };
      } else {
        return {
          measure: true,
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
          measure: true,
        };
      } else if (prop.axis && prop.columnIndex === undefined) {
        return {
          axis: true,
        };
      } else {
        return {
          columnIndex: prop.columnIndex!,
        };
      }
    case "Cell":
    case "RowAxis":
    case "RowHeader":
      return {
        row: prop.row,
        measure: prop.measure,
      };
    case "ColumnAxis":
      return {
        axis: true,
      };
    case "ColumnHeader":
      if (prop.columnIndex) {
        return {
          columnIndex: prop.columnIndex,
        };
      } else {
        return {
          measure: true,
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
  measuresPlacement,
  measuresMultiplier,
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
  measuresPlacement: "row" | "column";
  measuresMultiplier: number;
}) => {
  const rowsDepth = data.getPivotRows.length;
  const showMeasureLabelsInRows = measuresPlacement === "row";

  let rowHeadersCount =
    // if we place labels on the left in rows we need to double number of slots
    // because it will look like: labelA | valueA | labelB | valueB
    rowsDepth * (dimensionLabels.row === "left" ? 2 : 1) +
    // if we show measure labels and there is more than one measure add one slot for it
    (showMeasureLabelsInRows && measuresMultiplier > 1 ? 1 : 0) +
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
  measuresPlacement,
  measuresMultiplier,
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
  measuresPlacement: "row" | "column";
  measuresMultiplier: number;
}) => {
  const columnDepth = data.getPivotColumns().length;
  const showMeasureLabelsInColumns = measuresPlacement === "column";

  // see getRowHeadersCount for explanation
  let columnHeadersCount =
    columnDepth * (dimensionLabels.column === "top" ? 2 : 1) +
    (showMeasureLabelsInColumns && measuresMultiplier > 1 ? 1 : 0) +
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
  measuresPlacement,
  measuresMultiplier,
}: {
  data: PivotFrame<Name>;
  measuresPlacement: "row" | "column";
  measuresMultiplier: number;
  rowHeadersCount: number;
}) => rowHeadersCount + data.columnHeaders().length * (measuresPlacement === "column" ? measuresMultiplier : 1);

/**
 * Get total number of column slots required to show the grid e.g. number of headers + number of data cells
 * if we show measure labels in rows we need to increase number of data cell by number of measures
 */
export const getRowCount = <Name extends string = string>({
  columnHeadersCount,
  data,
  measuresPlacement,
  measuresMultiplier,
}: {
  data: PivotFrame<Name>;
  measuresPlacement: "row" | "column";
  measuresMultiplier: number;
  columnHeadersCount: number;
}) => columnHeadersCount + data.rowHeaders().length * (measuresPlacement === "row" ? measuresMultiplier : 1);
