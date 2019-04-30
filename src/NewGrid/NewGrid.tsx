import React, { useCallback, useMemo } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../DataFrame/FragmentFrame";
import { PivotFrame } from "../DataFrame/PivotFrame";
import { coordinateToHeightParam, coordinateToWidthParam, exhaustiveCheck, indexToCoordinate } from "./coordinateUitls";
import { HeightParam, WidthParam } from "./types";

// Default cell render prop for table display
const tableCell = <Name extends string = string>({ data, measure }: { data: FragmentFrame<Name>; measure: Name }) =>
  `${data.peak(measure)}`;

// Default border style
const borderStyle = "1px solid #e8e8e8";

// this doesn't work as expected
type Props<Name extends string = string> = {
  width: number;
  height: number;
  data: PivotFrame<Name>;
  cellStyle?: React.CSSProperties;
  axes?: {
    row?: (_: { row: string[]; width: number; height: number }) => React.ReactNode;
    column?: (_: { column: string[]; width: number; height: number }) => React.ReactNode;
  };
  accessors?: {
    width?: (p: WidthParam<Name>) => number;
    height?: (p: HeightParam<Name>) => number;
  };
} & (
  | {
      measures: Name[];
      measuresPlacement?: "row" | "column";
      cell?: (
        prop: {
          data: FragmentFrame<Name>;
          measure: Name;
          row: string[];
          column: string[];
          width: number;
          height: number;
        },
      ) => React.ReactNode;
    }
  | {
      cell: (
        prop: {
          data: FragmentFrame<Name>;
          row: string[];
          column: string[];
          width: number;
          height: number;
        },
      ) => React.ReactNode;
    });

export function NewGrid<Name extends string = string>(props: Props<Name>) {
  const { data, cellStyle } = props;
  const cell = props.cell || tableCell;
  const axes = props.axes || {};
  const accessors = props.accessors || {};
  const measures = "measures" in props ? props.measures : [];
  const measuresPlacement = ("measures" in props ? props.measuresPlacement : undefined) || "column";

  const measuresMultiplier = measures.length === 0 ? 1 : measures.length;
  const rowHeadersCount =
    (data.rowsIndex()[0] || []).length +
    (measuresPlacement === "row" && measuresMultiplier > 1 ? 1 : 0) +
    (axes.row ? 1 : 0);
  const columnHeadersCount =
    (data.columnsIndex()[0] || []).length +
    (measuresPlacement === "column" && measuresMultiplier > 1 ? 1 : 0) +
    (axes.column ? 1 : 0);
  const columnCount =
    rowHeadersCount + data.columnsIndex().length * (measuresPlacement === "column" ? measuresMultiplier : 1);
  const rowCount =
    columnHeadersCount + data.rowsIndex().length * (measuresPlacement === "row" ? measuresMultiplier : 1);

  const indexToCoordinateMemoised = useMemo(
    () =>
      indexToCoordinate({
        rowHeadersCount,
        measuresPlacement,
        columnHeadersCount,
        measuresMultiplier,
        data,
        axes,
        measures,
      }),
    [rowHeadersCount, measuresPlacement, columnHeadersCount, measuresMultiplier, data, axes, measures],
  );

  // Cell is repsonsible for rendering all kind of cells: dimensions, measure deimensions, data.
  // Because from the Grid point of view they all the same.
  // We use some math to differentiate what is what based on idexes.
  const Cell = useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const cellCoordinates = indexToCoordinateMemoised({ columnIndex, rowIndex });

      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: "#fff",
      };
      let item: React.ReactNode = null;

      const height = accessors.height
        ? accessors.height(coordinateToHeightParam(indexToCoordinateMemoised({ rowIndex, columnIndex: 0 })))
        : 100;
      const width = accessors.width
        ? accessors.width(coordinateToWidthParam(indexToCoordinateMemoised({ rowIndex: 0, columnIndex })))
        : 100;

      switch (cellCoordinates.type) {
        case "Empty":
          border = {};
          break;
        case "Cell":
          item = cell({
            data: data.cell(cellCoordinates.row, cellCoordinates.column),
            measure: cellCoordinates.measure!,
            row: cellCoordinates.row,
            column: cellCoordinates.column,
            height,
            width,
          });
          break;
        case "RowHeader":
          if (cellCoordinates.empty) {
            border = { borderLeft: borderStyle, background: "#fff" };
          } else {
            item =
              cellCoordinates.rowIndex !== undefined
                ? cellCoordinates.row[cellCoordinates.rowIndex]
                : cellCoordinates.measure;
          }
          break;
        case "ColumnHeader":
          if (cellCoordinates.empty) {
            border = { borderTop: borderStyle, background: "#fff" };
          } else {
            item =
              cellCoordinates.columnIndex !== undefined
                ? cellCoordinates.column[cellCoordinates.columnIndex]
                : cellCoordinates.measure;
          }
          break;
        case "RowAxis":
          if (axes.row) {
            item = axes.row({ row: cellCoordinates.row, height, width });
          }
          break;
        case "ColumnAxis":
          if (axes.column) {
            item = axes.column({ column: cellCoordinates.column, height, width });
          }
          break;
        default:
          exhaustiveCheck(cellCoordinates);
      }

      return <div style={{ ...cellStyle, ...border, ...style }}>{item}</div>;
    },
    [indexToCoordinateMemoised, data, cell],
  );

  const rowHeight = useCallback(
    (rowIndex: number) => {
      const param = coordinateToHeightParam(indexToCoordinateMemoised({ rowIndex, columnIndex: 0 }));
      return accessors.height ? accessors.height(param) : 100;
    },
    [accessors.height, indexToCoordinateMemoised],
  );

  const columnWidth = useCallback(
    (columnIndex: number) => {
      const param = coordinateToWidthParam(indexToCoordinateMemoised({ rowIndex: 0, columnIndex }));
      return accessors.width ? accessors.width(param) : 100;
    },
    [accessors.height, indexToCoordinateMemoised],
  );

  return (
    <VariableSizeGrid
      height={props.height}
      width={props.width}
      columnCount={columnCount}
      rowCount={rowCount}
      rowHeight={rowHeight}
      columnWidth={columnWidth}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
