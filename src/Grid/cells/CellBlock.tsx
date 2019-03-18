import React from "react";
import { ReadonlyDataset } from "../../data_handling/multidimensional_dataset";
import { Accessors } from "../types";
import GridCell from "./GridCell";

interface Props {
  data: ReadonlyDataset;
  accessors: Accessors;
  width: number;
}

const cellContainerStyle = (width: Props["width"]): React.CSSProperties => ({
  width,
  float: "left",
});

const CellBlock: React.SFC<Props> = ({ data, accessors, width }) => (
  <div style={cellContainerStyle(width)}>
    {data
      .rows()
      .map((row, j) =>
        row
          .cells()
          .map((cell, i) => (
            <GridCell
              cell={cell}
              width={accessors.columns.width(data.columns()[i])}
              height={accessors.rows.height(row)}
              key={`${i},${j}`}
              cellAccessors={accessors.cells}
            />
          )),
      )}
  </div>
);

export default CellBlock;
