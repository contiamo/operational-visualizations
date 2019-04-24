import React from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../data_handling/FragmentFrame";
import { PivotFrame } from "../data_handling/PivotFrame";

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
} & (
  | {
      measures: Name[];
      measuresPlacement?: "row" | "column";
      cell?: (prop: { data: FragmentFrame<Name>; measure: Name }) => React.ReactNode;
    }
  | {
      measures: never;
      measuresPlacement: never;
      cell: (prop: { data: FragmentFrame<Name> }) => React.ReactNode;
    });

export function NewGrid<Name extends string = string>(props: Props<Name>) {
  const { width, height, data } = props;
  const cell = props.cell || tableCell;
  const measures = "measures" in props ? props.measures : [];
  const measuresPlacement = ("measures" in props ? props.measuresPlacement : undefined) || "column";

  /**
   *        Columns
   *       +---+---+
   *       |a|a|s|s|
   *       +-------+
   *       |d|f|g|h|
   *   +-----------+
   *   |q|e|       |
   *   |-+-+       |
   *  R|q|r|       |
   *  o+---+       |
   *  w|q|t|       |
   *  s|-+-+       |
   *   |q|y|       |
   *   +-----------+
   *
   *  columnCount = [[a,d],[a,f],[s,g],[s,h]].count + [q,s].count
   *  rowCount = [[q,e],[q,r],[w,t],[w,y]].count + [a,d].count
   */

  const measuresMultiplier = measures.length === 0 ? 1 : measures.length;
  const rowHeadersCount =
    (data.rowsIndex()[0] || []).length + (measuresPlacement === "row" && measuresMultiplier > 1 ? 1 : 0);
  const columnHeadersCount =
    (data.columnsIndex()[0] || []).length + (measuresPlacement === "column" && measuresMultiplier > 1 ? 1 : 0);
  const columnCount =
    rowHeadersCount + data.columnsIndex().length * (measuresPlacement === "column" ? measuresMultiplier : 1);
  const rowCount =
    columnHeadersCount + data.rowsIndex().length * (measuresPlacement === "row" ? measuresMultiplier : 1);

  // Cell is repsonsible for rendering all kind of cells: dimensions, measure deimensions, data.
  // Because from the Grid point of view they all the same.
  // We use some math to differentiate what is what based on idexes.
  const Cell = React.useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: "#fff",
      };

      const columnIndexReal = Math.floor(
        (columnIndex - rowHeadersCount) / (measuresPlacement === "column" ? measuresMultiplier : 1),
      );
      const rowIndexReal = Math.floor(
        (rowIndex - columnHeadersCount) / (measuresPlacement === "row" ? measuresMultiplier : 1),
      );
      const measuresIndex =
        (measuresPlacement === "column" ? columnIndex - rowHeadersCount : rowIndex - columnHeadersCount) %
        measuresMultiplier;

      let item: React.ReactNode;
      if (columnIndex < rowHeadersCount && rowIndex < columnHeadersCount) {
        // empty cells in the left top corner
        item = null;
        border = {};
      } else if (columnIndex < rowHeadersCount) {
        // row headers
        const dimension = data.rowsIndex()[rowIndexReal][columnIndex];
        const prevRow = data.rowsIndex()[rowIndexReal - 1];
        if (!dimension) {
          // measure dimension
          item = measures[measuresIndex];
        } else if (
          (prevRow && prevRow[columnIndex] === dimension) ||
          (measuresIndex > 0 && measuresPlacement === "row")
        ) {
          // previous cell is the same, so render blank cell
          border = { borderLeft: borderStyle, background: "#fff" };
          item = null;
        } else {
          item = `${dimension}`;
        }
      } else if (rowIndex < columnHeadersCount) {
        // column headers
        const dimension = data.columnsIndex()[columnIndexReal][rowIndex];
        const prevColumn = data.columnsIndex()[columnIndexReal - 1];
        if (!dimension) {
          // measure dimension
          item = measures[measuresIndex];
        } else if (
          (prevColumn && prevColumn[rowIndex] === dimension) ||
          (measuresIndex > 0 && measuresPlacement === "column")
        ) {
          // previous cell is the same, so render blank cell
          border = { borderTop: borderStyle, background: "#fff" };
          item = null;
        } else {
          item = `${dimension}`;
        }
      } else {
        // data cells
        item = cell({
          data: data.cell(data.rowsIndex()[columnIndexReal], data.columnsIndex()[columnIndexReal]),
          measure: measures[measuresIndex],
        });
      }

      return <div style={{ padding: "10px", ...border, ...style }}>{item}</div>;
    },
    [data, measuresMultiplier, rowHeadersCount, columnHeadersCount, cell, ...measures],
  );

  return (
    <VariableSizeGrid
      height={height}
      width={width}
      columnCount={columnCount}
      rowCount={rowCount}
      rowHeight={() => 100}
      columnWidth={() => 100}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
