import React from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import { FragmentFrame } from "../data_handling/FragmentFrame";
import { PivotFrame } from "../data_handling/PivotFrame";

interface Props<Name extends string = string> {
  width: number;
  height: number;
  data: PivotFrame<Name>;
  cell: (data: FragmentFrame<Name>) => React.ReactNode;
}

export function NewGrid<Name extends string = string>({ width, height, data, cell }: Props<Name>) {
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

  const rowHeadersCount = (data.rowsIndex()[0] || []).length;
  const columnHeadersCount = (data.columnsIndex()[0] || []).length;
  const columnCount = data.columnsIndex().length + rowHeadersCount;
  const rowCount = data.rowsIndex().length + columnHeadersCount;

  const Cell = React.useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      let item: React.ReactNode;
      const borderStyle = "1px solid #e8e8e8";
      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: "#fff",
      };
      if (columnIndex < rowHeadersCount && rowIndex < columnHeadersCount) {
        item = null;
        border = {};
      } else if (columnIndex < rowHeadersCount) {
        const dimension = data.rowsIndex()[rowIndex - columnHeadersCount][columnIndex];
        const prevRow = data.rowsIndex()[rowIndex - columnHeadersCount - 1];
        if (prevRow && prevRow[columnIndex] === dimension) {
          border = { borderLeft: borderStyle, background: "#fff" };
          item = null;
        } else {
          item = `${dimension}`;
        }
      } else if (rowIndex < columnHeadersCount) {
        const dimension = data.columnsIndex()[columnIndex - rowHeadersCount][rowIndex];
        const prevColumn = data.columnsIndex()[columnIndex - rowHeadersCount - 1];
        if (prevColumn && prevColumn[rowIndex] === dimension) {
          border = { borderTop: borderStyle, background: "#fff" };
          item = null;
        } else {
          item = `${dimension}`;
        }
      } else {
        item = cell(
          data.cell(
            data.rowsIndex()[rowIndex - columnHeadersCount],
            data.columnsIndex()[columnIndex - rowHeadersCount],
          ),
        );
      }
      return <div style={{ padding: "10px", ...border, ...style }}>{item}</div>;
    },
    [data],
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
