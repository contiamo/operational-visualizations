import React, { useCallback, useMemo } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../DataFrame/FragmentFrame";
import { PivotFrame } from "../DataFrame/PivotFrame";
import { coordinateToHeightParam, coordinateToWidthParam, exhaustiveCheck, indexToCoordinate } from "./coordinateUtils";
import { HeightParam, WidthParam } from "./types";

type Diff<T, U> = T extends U ? never : T;
type Defined<T> = Diff<T, undefined>;

// Optimisation for hooks, because {} !== {}
const emptyObject = Object.freeze({});

const defaultBorderStyle = "1px solid #e8e8e8";

const defaultCell = <Name extends string = string>({ data, measure }: { data: FragmentFrame<Name>; measure: Name }) => {
  const value = data.peak(measure);
  return value === null ? "-" : `${value}`;
};

const defaultWidth = () => 120;
const defaultHeight = () => 35;

type Props<Name extends string = string> = {
  width: number;
  height: number;
  data: PivotFrame<Name>;
  style?: {
    cell?: React.CSSProperties;
    border?: string;
  };
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
  const { data } = props;
  const cell = props.cell || defaultCell;
  const axes = props.axes || (emptyObject as Defined<Props<Name>["axes"]>);
  const accessors = props.accessors || (emptyObject as Defined<Props<Name>["accessors"]>);
  const heightAccessors = accessors.height || (defaultHeight as Defined<Defined<Props<Name>["accessors"]>["height"]>);
  const widthAccessors = accessors.width || (defaultWidth as Defined<Defined<Props<Name>["accessors"]>["width"]>);

  const styleProp = props.style || (emptyObject as Defined<Props<Name>["style"]>);
  const borderStyle = styleProp.border || defaultBorderStyle;
  const cellStyle = styleProp.cell || emptyObject;

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

  const rowHeight = useCallback(
    (rowIndex: number) =>
      heightAccessors(coordinateToHeightParam(indexToCoordinateMemoised({ rowIndex, columnIndex: 0 }))),
    [heightAccessors, indexToCoordinateMemoised],
  );

  const columnWidth = useCallback(
    (columnIndex: number) =>
      widthAccessors(coordinateToWidthParam(indexToCoordinateMemoised({ rowIndex: 0, columnIndex }))),
    [widthAccessors, indexToCoordinateMemoised],
  );

  // Cell is repsonsible for rendering all kind of cells: dimensions, measure deimensions, data, axes.
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

      const height = rowHeight(rowIndex);
      const width = columnWidth(columnIndex);

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
    [indexToCoordinateMemoised, data, cell, borderStyle, cellStyle, rowHeight, columnWidth],
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
