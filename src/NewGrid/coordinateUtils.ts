import { PivotFrame } from "../DataFrame/PivotFrame";
import { CellCoordinates, HeightParam, WidthParam } from "./types";

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
  },
) => (prop: { columnIndex: number; rowIndex: number }) => CellCoordinates<Name>;

// tslint:disable
/**
 * We use virtual scrolling in the Grid, so we need to be able to tell the size of each cell in the grid.
 * We decided to treat all type of cells as if they are in one big grid, including cells with headers, axes, measure names, values.
 * This function takes index coordinates in the "big grid" (x, y) and converts it to specific type of cells, 
 * for example `{ type: Empty }`, `{ type: Cell }`... so we would be able to pattern match against type 
 * and render appropriate cell or tell the dimenstion of the cell.
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

  if (columnIndex < rowHeadersCount && rowIndex < columnHeadersCount) {
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
  } else if (columnIndex < rowHeadersCount) {
    // row headers
    const dimension = data.rowHeaders()[rowIndexReal][columnIndex];
    const prevRow = data.rowHeaders()[rowIndexReal - 1];
    if (!dimension) {
      if (axes.row && columnIndex === rowHeadersCount - 1) {
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
        rowIndex: columnIndex,
        empty: (prevRow && prevRow[columnIndex] === dimension) || (measuresIndex > 0 && measuresPlacement === "row"),
      };
    }
  } else if (rowIndex < columnHeadersCount) {
    // column headers
    const dimension = data.columnHeaders()[columnIndexReal][rowIndex];
    const prevColumn = data.columnHeaders()[columnIndexReal - 1];
    if (!dimension) {
      if (axes.column && rowIndex === columnHeadersCount - 1) {
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
        columnIndex: rowIndex,
        empty:
          (prevColumn && prevColumn[rowIndex] === dimension) || (measuresIndex > 0 && measuresPlacement === "column"),
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
