import { PivotFrame } from "@operational/frame";
import React, { useCallback, useMemo } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";

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

import {
  DimensionLabels,
  RowProps,
  ColumnProps,
  CellPropsWithMeasure,
  CellPropsWithoutMeasure,
  WidthAccessor,
  HeightAccessor,
} from "./types";

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

const defaultCell = ({ column, row, data, rowMeasure, columnMeasure }: CellPropsWithMeasure<string>) => {
  if (rowMeasure && columnMeasure) {
    throw new Error("Can't use two measures for text based grid");
  }
  const value = data.cell(row, column).peak(rowMeasure || columnMeasure);
  return value === null ? null : <>{value}</>;
};

const defaultHeader = ({ value }: { value: string; width: number; height: number }) => (
  <span title={toString(value)}>{toString(value)}</span>
);

const defaultWidth = () => 120;
const defaultHeight = () => 35;

const defaultHeaderStyle: React.CSSProperties = {
  padding: "10px",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

const defaultDimensionStyle: React.CSSProperties = {
  fontWeight: "bold",
};

/**
 * We support text only pivot grid out of the box,
 * for this case you don't need to provide cell render prop, but you need to provide measures
 */
type TextOnlyPivotGridProps<Name extends string> =
  | {
      type?: "text";
      rowMeasures: Name[];
      columnMeasures?: undefined;
    }
  | {
      type?: "text";
      rowMeasures?: undefined;
      columnMeasures: Name[];
    };

/**
 * This is props for general PivotGrid, you need to provide cell render prop.
 * It can return any React component which will be rendered in cells
 */
type GeneralPivotGridProps<Name extends string> =
  | {
      type: "general";
      cell: (prop: CellPropsWithoutMeasure<Name>) => React.ReactElement | null;
    }
  | {
      type: "generalWithMeasures";
      rowMeasures?: Name[];
      columnMeasures?: Name[];
      cell: (prop: CellPropsWithMeasure<Name>) => React.ReactElement | null;
    };

interface Accessors<Name extends string> {
  width?: WidthAccessor<Name>;
  height?: HeightAccessor<Name>;
}

interface Axes<Name extends string> {
  row?: (prop: RowProps<Name>) => React.ReactElement | null;
  column?: (prop: ColumnProps<Name>) => React.ReactElement | null;
}

interface PivotGridStyle {
  // Static cell styles
  cell?: React.CSSProperties;
  header?: React.CSSProperties;
  dimension?: React.CSSProperties;
  border?: string;
  background?: string;
}

type Props<Name extends string = string> = (TextOnlyPivotGridProps<Name> | GeneralPivotGridProps<Name>) & {
  width: number;
  height: number;
  data: PivotFrame<Name>;
  style?: PivotGridStyle;
  axes?: Axes<Name>;
  accessors?: Accessors<Name>;
  header?: (prop: { width: number; height: number; value: string }) => React.ReactElement | null;
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

export const PivotGrid = React.memo(<Name extends string = string>(props: Props<Name>) => {
  // assigning default values
  const { data } = props;
  const cell = "cell" in props && props.cell ? props.cell : defaultCell;
  const header = props.header || defaultHeader;
  const axes = props.axes || (emptyObject as Axes<Name>);
  const accessors = props.accessors || (emptyObject as Accessors<Name>);
  const heightAccessors = accessors.height || (defaultHeight as HeightAccessor<Name>);
  const widthAccessors = accessors.width || (defaultWidth as WidthAccessor<Name>);
  const dimensionLabels = useMemo(
    () => (dimensionLabelsShortcut(props.dimensionLabels) || { row: "none", column: "none" }) as DimensionLabels,
    [props.dimensionLabels],
  );
  const styleProp = props.style || (emptyObject as PivotGridStyle);
  const borderStyle = styleProp.border || defaultBorderStyle;
  const cellStyle = styleProp.cell;
  const dimensionStyle = styleProp.dimension || defaultDimensionStyle;
  const headerStyle = styleProp.header || defaultHeaderStyle;
  const backgroundStyle = styleProp.background || defaultBackground;
  const rowMeasures = "rowMeasures" in props && props.rowMeasures ? props.rowMeasures : [];
  const columnMeasures = "columnMeasures" in props && props.columnMeasures ? props.columnMeasures : [];
  const rowMeasuresCount = rowMeasures.length;
  const columnMeasuresCount = columnMeasures.length;

  // calculating size of the grid
  const rowHeadersCount = getRowHeadersCount({
    axes,
    data,
    dimensionLabels,
    rowMeasuresCount,
    columnMeasuresCount,
  });
  const columnHeadersCount = getColumnHeadersCount({
    axes,
    data,
    dimensionLabels,
    rowMeasuresCount,
    columnMeasuresCount,
  });
  const columnCount = getColumnCount({ rowHeadersCount, data, rowMeasuresCount, columnMeasuresCount });
  const rowCount = getRowCount({
    columnHeadersCount,
    data,
    rowMeasuresCount,
    columnMeasuresCount,
  });

  const indexToCoordinateMemoised = useMemo(
    () =>
      indexToCoordinate({
        rowHeadersCount,
        columnHeadersCount,
        data,
        axes,
        rowMeasures,
        columnMeasures,
        dimensionLabels,
      }),
    [rowHeadersCount, columnHeadersCount, data, axes, dimensionLabels, rowMeasures, columnMeasures],
  );

  const rowHeight = useCallback(
    (rowIndex: number) =>
      heightAccessors({ data, ...coordinateToHeightParam(indexToCoordinateMemoised({ rowIndex, columnIndex: 0 })) }),
    [heightAccessors, indexToCoordinateMemoised, data],
  );

  const columnWidth = useCallback(
    (columnIndex: number) =>
      widthAccessors({ data, ...coordinateToWidthParam(indexToCoordinateMemoised({ rowIndex: 0, columnIndex })) }),
    [widthAccessors, indexToCoordinateMemoised, data],
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
      };
      let item: React.ReactNode = null;

      const height = rowHeight(rowIndex);
      const width = columnWidth(columnIndex);

      // TODO refactor item, border assignment see https://github.com/contiamo/operational-visualizations/issues/47
      switch (cellCoordinates.type) {
        case "Empty":
          if (cellCoordinates.dimensionLabel !== undefined) {
            border = { ...headerStyle, ...dimensionStyle, ...border };
            const value = cellCoordinates.dimensionLabel;
            item = React.createElement(header, { value, height, width });
          } else {
            border = { ...headerStyle };
          }
          break;
        case "Cell":
          border = {
            ...cellStyle,
            ...border,
          };

          item = React.createElement(cell, {
            data,
            width,
            height,
            rowMeasure: cellCoordinates.rowMeasure!,
            columnMeasure: cellCoordinates.columnMeasure!,
            row: cellCoordinates.row,
            column: cellCoordinates.column,
          });
          break;
        case "RowHeader":
          if (cellCoordinates.empty) {
            border = { ...headerStyle, borderLeft: borderStyle };
          } else {
            if (cellCoordinates.rowIndex !== undefined) {
              border = { ...headerStyle, ...border };
              const value = cellCoordinates.label!;
              item = React.createElement(header, { value, height, width });
            } else {
              border = { ...headerStyle, ...dimensionStyle, ...border };
              const value = cellCoordinates.measure!;
              item = React.createElement(header, { value, height, width });
            }
          }
          break;
        case "ColumnHeader":
          if (cellCoordinates.empty) {
            border = { ...headerStyle, borderTop: borderStyle };
          } else {
            if (cellCoordinates.columnIndex !== undefined) {
              border = { ...headerStyle, ...border };
              const value = cellCoordinates.label!;
              item = React.createElement(header, { value, height, width });
            } else {
              border = { ...headerStyle, ...dimensionStyle, ...border };
              const value = cellCoordinates.measure!;
              item = React.createElement(header, { value, height, width });
            }
          }
          break;
        case "RowAxis":
          if (axes.row) {
            item = React.createElement(axes.row, {
              data,
              width,
              height,
              row: cellCoordinates.row,
              measure: cellCoordinates.measure,
            });
          }
          break;
        case "ColumnAxis":
          if (axes.column) {
            item = React.createElement(axes.column, {
              data,
              width,
              height,
              column: cellCoordinates.column,
              measure: cellCoordinates.measure,
            });
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
      axes,
      dimensionStyle,
    ],
  );

  return (
    <div style={{ background: backgroundStyle, height: props.height, width: props.width }}>
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
    </div>
  );
}) as <Name extends string = string>(props: Props<Name>) => JSX.Element;
