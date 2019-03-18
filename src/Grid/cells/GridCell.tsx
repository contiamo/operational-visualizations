import React from "react";
import { Cell } from "../../data_handling/multidimensional_dataset";
import { CellAccessors } from "../types";

interface Props {
  cell: Cell;
  width: number;
  height: number;
  cellAccessors: CellAccessors;
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

const GridCell: React.SFC<Props> = props => (
  <div style={cellStyle(props)}>{props.cell.value()({ width: props.width, height: props.height })}</div>
);

export default GridCell;
