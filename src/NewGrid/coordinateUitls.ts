import { PivotFrame } from "../data_handling/PivotFrame";
import { CellCoordinates, HeightParam, WidthParam } from "./types";

export const exhaustiveCheck = (_: never) => undefined;

export type IndexToCoordinate = <Name extends string = string>(prop: {
  rowHeadersCount: number;
  measuresPlacement: "row" | "column";
  columnHeadersCount: number;
  measuresMultiplier: number;
  data: PivotFrame<Name>;
  axes: {
    row?: (_: { row: string[]; width: number; height: number }) => React.ReactNode;
    column?: (_: { column: string[]; width: number; height: number }) => React.ReactNode;
  };

  measures: Name[];
}) => (prop: { columnIndex: number; rowIndex: number }) => CellCoordinates<Name>;

export const indexToCoordinate: IndexToCoordinate = ({
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
    // one huge fizz buzz, need to fix this
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
    const dimension = data.rowsIndex()[rowIndexReal][columnIndex];
    const prevRow = data.rowsIndex()[rowIndexReal - 1];
    if (!dimension) {
      if (axes.row && columnIndex === rowHeadersCount - 1) {
        return {
          type: "RowAxis",
          row: data.rowsIndex()[rowIndexReal],
          measure: measures[measuresIndex],
        };
      } else {
        // measure dimension
        return {
          type: "RowHeader",
          row: data.rowsIndex()[rowIndexReal],
          measure: measures[measuresIndex],
        };
      }
    } else {
      return {
        type: "RowHeader",
        row: data.rowsIndex()[rowIndexReal],
        measure: measures[measuresIndex],
        rowIndex: columnIndex,
        empty: (prevRow && prevRow[columnIndex] === dimension) || (measuresIndex > 0 && measuresPlacement === "row"),
      };
    }
  } else if (rowIndex < columnHeadersCount) {
    // column headers
    const dimension = data.columnsIndex()[columnIndexReal][rowIndex];
    const prevColumn = data.columnsIndex()[columnIndexReal - 1];
    if (!dimension) {
      if (axes.column && rowIndex === columnHeadersCount - 1) {
        return {
          type: "ColumnAxis",
          column: data.columnsIndex()[columnIndexReal],
          measure: measures[measuresIndex],
        };
      } else {
        // measure dimension
        return {
          type: "ColumnHeader",
          column: data.columnsIndex()[columnIndexReal],
          measure: measures[measuresIndex],
        };
      }
    } else {
      return {
        type: "ColumnHeader",
        column: data.columnsIndex()[columnIndexReal],
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
      row: data.rowsIndex()[rowIndexReal],
      column: data.columnsIndex()[columnIndexReal],
      measure: measures[measuresIndex],
    };
  }
};

// those functions (coordinateToWidthParam, coordinateToHeightParam) take into account 15 or more use-cases
// but in reality we use only 7, because one of the coordinates is always 0 .e.g. first row or firs column
// I nee to simplify it

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
      throw new Error("not exhaustive");
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
      throw new Error("not exhaustive");
  }
};
