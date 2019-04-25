import React from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../data_handling/FragmentFrame";
import { PivotFrame } from "../data_handling/PivotFrame";
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
    row?: (row: string[]) => React.ReactNode;
    column?: (column: string[]) => React.ReactNode;
  };
  accessors?: {
    width?: (p: WidthParam<Name>) => number;
    height?: (p: HeightParam<Name>) => number;
  };
} & (
  | {
      measures: Name[];
      measuresPlacement?: "row" | "column";
      cell?: (prop: { data: FragmentFrame<Name>; measure: Name }) => React.ReactNode;
    }
  | {
      cell: (prop: { data: FragmentFrame<Name> }) => React.ReactNode;
    });

export function NewGrid<Name extends string = string>(props: Props<Name>) {
  const { width, height, data, cellStyle } = props;
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

  const indexToCoordinateMemoised = React.useMemo(
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
  const Cell = React.useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const cellCoordinates = indexToCoordinateMemoised({ columnIndex, rowIndex });

      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: "#fff",
      };
      let item: React.ReactNode = null;

      switch (cellCoordinates.type) {
        case "Empty":
          border = {};
          break;
        case "Cell":
          item = cell({
            data: data.cell(cellCoordinates.row, cellCoordinates.column),
            measure: cellCoordinates.measure!,
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
            item = axes.row(cellCoordinates.row);
          }
          break;
        case "ColumnAxis":
          if (axes.column) {
            item = axes.column(cellCoordinates.column);
          }
          break;
        default:
          exhaustiveCheck(cellCoordinates);
      }

      return <div style={{ ...cellStyle, ...border, ...style }}>{item}</div>;
    },
    [indexToCoordinateMemoised, data, cell],
  );

  return (
    <VariableSizeGrid
      height={height}
      width={width}
      columnCount={columnCount}
      rowCount={rowCount}
      rowHeight={rowIndex => {
        const param = coordinateToHeightParam(indexToCoordinateMemoised({ rowIndex, columnIndex: 0 }));
        return accessors.height ? accessors.height(param) : 100;
      }}
      columnWidth={columnIndex => {
        const param = coordinateToWidthParam(indexToCoordinateMemoised({ rowIndex: 0, columnIndex }));
        return accessors.width ? accessors.width(param) : 100;
      }}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
