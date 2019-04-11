import React from "react";
import { Cell } from "../../data_handling/multidimensional_dataset";
import { CellAccessors } from "../types";

interface Props<T = any> {
  cell: Cell<T>;
  width: number;
  height: number;
  cellAccessors: CellAccessors<T>;
  renderer: (props: { cell: T; width: number; height: number }) => React.ReactNode;
}

const cellStyle = ({ cell, width, height, cellAccessors }: Props): React.CSSProperties => ({
  borderStyle: "solid",
  float: "left",
  textAlign: "end",
  height,
  width,
  lineHeight: `${height}px`,
  color: cellAccessors.color(cell),
  borderWidth: `${cellAccessors.borderWidth(cell)}px`,
  borderColor: cellAccessors.borderColor(cell),
  backgroundColor: cellAccessors.backgroundColor(cell),
});

function GridCell<T>(props: Props<T>) {
  return (
    <div style={cellStyle(props)}>
      {props.renderer({ cell: props.cell.value(), width: props.width, height: props.height })}
    </div>
  );
}

export default React.memo(GridCell) as typeof GridCell;
