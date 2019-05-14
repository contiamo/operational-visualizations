import React, { useCallback, useMemo } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../DataFrame/FragmentFrame";
import { PivotFrame } from "../DataFrame/PivotFrame";

import {
  coordinateToHeightParam,
  coordinateToWidthParam,
  exhaustiveCheck,
  getColumnCount,
  getColumnHeadersCount,
  getRowCount,
  getRowHeadersCount,
  indexToCoordinate,
} from "./coordinateUtils";

import { DimensionLabels, HeightParam, WidthParam } from "./types";

type Diff<T, U> = T extends U ? never : T;
type Defined<T> = Diff<T, undefined>;

// Optimisation for hooks, because {} !== {}
const emptyObject = Object.freeze({});

const defaultBorderStyle = "1px solid #e8e8e8";
const defaultBackground = "#fff";

const toString = (value: boolean | string) => {
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  return value;
};

const defaultCell = <Name extends string = string>({ data, measure }: { data: FragmentFrame<Name>; measure: Name }) => {
  const value = data.peak(measure);
  return value === null ? "–" : `${value}`;
};

const defaultHeader = ({ value }: { value: string; width: number; height: number }) => toString(value);

const defaultWidth = () => 120;
const defaultHeight = () => 35;

const defaultHeaderStyle: React.CSSProperties = {
  padding: "10px",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

/**
 * We support text only pivot grid out of the box,
 * for this case you don't need to provide cell render prop, but you need to provide measures
 */
interface TextOnlyPivotGridProps<Name extends string> {
  measures: Name[];
  /** default value is "column" */
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

/**
 * This is props for general PivotGrid, you need to provide cell render prop.
 * It can return any React component which will be rendered in cells
 */
interface GeneralPivotGridProps<Name extends string> {
  cell: (
    prop: {
      data: FragmentFrame<Name>;
      row: string[];
      column: string[];
      width: number;
      height: number;
    },
  ) => React.ReactNode;
}

interface Accessors<Name extends string> {
  width?: (p: WidthParam<Name>) => number;
  height?: (p: HeightParam<Name>) => number;
}

interface Axes {
  row?: (rowProps: { row: string[]; width: number; height: number }) => React.ReactNode;
  column?: (columnProps: { column: string[]; width: number; height: number }) => React.ReactNode;
}

interface PivotGridStyle {
  cell?: React.CSSProperties;
  header?: React.CSSProperties;
  border?: string;
  background?: string;
}

type Props<Name extends string = string> = (TextOnlyPivotGridProps<Name> | GeneralPivotGridProps<Name>) & {
  width: number;
  height: number;
  data: PivotFrame<Name>;
  style?: PivotGridStyle;
  axes?: Axes;
  accessors?: Accessors<Name>;
  header?: (
    prop: {
      value: string;
      width: number;
      height: number;
    },
  ) => React.ReactNode;
  dimensionLabels?: DimensionLabels | "top" | "left" | "none";
};

/**
 * For convinience we allow shortucts "top" | "left" | "none" for PivotGrid component for dimensionLabels prop,
 * For example, "top" is shortcut for { row: "top", column: "top" }.
 * This function converts from shortcut to extended version
 */
const dimensionLabelsShortcut = (dimensionLabels?: DimensionLabels | "top" | "left" | "none") =>
  (typeof dimensionLabels === "string" ? { row: dimensionLabels, column: dimensionLabels } : dimensionLabels) as
    | DimensionLabels
    | undefined;

export function PivotGrid<Name extends string = string>(props: Props<Name>) {
  // assigning default values
  const { data } = props;
  const cell = props.cell || defaultCell;
  const header = props.header || defaultHeader;
  const axes = props.axes || (emptyObject as Axes);
  const accessors = props.accessors || (emptyObject as Accessors<Name>);
  const heightAccessors = accessors.height || (defaultHeight as Defined<Accessors<Name>["height"]>);
  const widthAccessors = accessors.width || (defaultWidth as Defined<Accessors<Name>["width"]>);
  const dimensionLabels = dimensionLabelsShortcut(props.dimensionLabels) || { row: "none", column: "none" };
  const styleProp = props.style || (emptyObject as PivotGridStyle);
  const borderStyle = styleProp.border || defaultBorderStyle;
  const cellStyle = styleProp.cell || emptyObject;
  const headerStyle = styleProp.header || defaultHeaderStyle;
  const backgroundStyle = styleProp.background || defaultBackground;
  const measures = "measures" in props ? props.measures : [];
  const measuresPlacement = ("measures" in props ? props.measuresPlacement : undefined) || "column";

  // calculating size of the grid
  const measuresCount = measures.length === 0 ? 1 : measures.length;
  const rowHeadersCount = getRowHeadersCount({ axes, data, dimensionLabels, measuresPlacement, measuresCount });
  const columnHeadersCount = getColumnHeadersCount({
    axes,
    data,
    dimensionLabels,
    measuresPlacement,
    measuresCount,
  });
  const columnCount = getColumnCount({ rowHeadersCount, data, measuresPlacement, measuresCount });
  const rowCount = getRowCount({
    columnHeadersCount,
    data,
    measuresPlacement,
    measuresCount,
  });

  const indexToCoordinateMemoised = useMemo(
    () =>
      indexToCoordinate({
        rowHeadersCount,
        measuresPlacement,
        columnHeadersCount,
        measuresCount,
        data,
        axes,
        measures,
        dimensionLabels,
      }),
    [
      rowHeadersCount,
      measuresPlacement,
      columnHeadersCount,
      measuresCount,
      data,
      axes,
      measures,
      dimensionLabels.row,
      dimensionLabels.column,
    ],
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

  /**
   * Cell is repsonsible for rendering all kind of cells: dimensions, measure deimensions, data, axes.
   * Because from the Grid point of view they all the same.
   * We use some math to differentiate what is what based on idexes.
   */
  const Cell = useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const cellCoordinates = indexToCoordinateMemoised({ columnIndex, rowIndex });

      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: backgroundStyle,
      };
      let item: React.ReactNode = null;

      const height = rowHeight(rowIndex);
      const width = columnWidth(columnIndex);

      switch (cellCoordinates.type) {
        case "Empty":
          if (cellCoordinates.dimensionLabel !== undefined) {
            border = { ...headerStyle, ...border };
            item = `${cellCoordinates.dimensionLabel}`;
          } else {
            border = {};
          }
          break;
        case "Cell":
          border = {
            ...cellStyle,
            ...border,
          };

          item = cell({
            data: data.cell(cellCoordinates.rowIndex, cellCoordinates.columnIndex),
            measure: cellCoordinates.measure!,
            row: cellCoordinates.row,
            column: cellCoordinates.column,
            height,
            width,
          });
          break;
        case "RowHeader":
          if (cellCoordinates.empty) {
            border = { ...headerStyle, borderLeft: borderStyle, background: backgroundStyle };
          } else {
            border = { ...headerStyle, ...border };
            const value = (cellCoordinates.rowIndex !== undefined
              ? cellCoordinates.row[cellCoordinates.rowIndex]
              : cellCoordinates.measure)!;
            item = header({ value, height, width });
          }
          break;
        case "ColumnHeader":
          if (cellCoordinates.empty) {
            border = { ...headerStyle, borderTop: borderStyle, background: backgroundStyle };
          } else {
            border = { ...headerStyle, ...border };
            const value = (cellCoordinates.columnIndex !== undefined
              ? cellCoordinates.column[cellCoordinates.columnIndex]
              : cellCoordinates.measure)!;
            item = header({ value, height, width });
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

      if (columnIndex === columnCount - 1) {
        border.borderRight = borderStyle;
      }
      if (rowIndex === rowCount - 1) {
        border.borderBottom = borderStyle;
      }

      return <div style={{ ...border, ...style }}>{item}</div>;
    },
    [
      columnCount,
      rowCount,
      indexToCoordinateMemoised,
      data,
      cell,
      header,
      rowHeight,
      columnWidth,
      borderStyle,
      cellStyle,
      headerStyle,
      backgroundStyle,
    ],
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