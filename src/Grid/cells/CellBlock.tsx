import React from "react";
import { ReadonlyDataset } from "../../data_handling/multidimensional_dataset";
import { Accessors } from "../types";
import GridCell from "./GridCell";

interface Props<T = any> {
  data: ReadonlyDataset<T>;
  accessors: Accessors;
  width: number;
  cell: (props: { cell: T; width: number; height: number }) => React.ReactNode;
}

const cellContainerStyle = (width: Props["width"]): React.CSSProperties => ({
  width,
  float: "left",
});

function CellBlock<T>({ data, accessors, width, cell: renderer }: Props<T>) {
  return (
    <div style={cellContainerStyle(width)}>
      {data
        .rows()
        .map((row, j) =>
          row
            .cells()
            .map((cell, i) => (
              <GridCell
                cell={cell}
                renderer={renderer}
                width={accessors.columns.width(data.columns()[i])}
                height={accessors.rows.height(row)}
                key={`${i},${j}`}
                cellAccessors={accessors.cells}
              />
            )),
        )}
    </div>
  );
}

export default React.memo(CellBlock) as typeof CellBlock;
