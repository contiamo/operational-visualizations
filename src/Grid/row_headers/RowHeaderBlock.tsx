import React from "react";
import { DimensionWithPrimitiveAndMetadata, RowOrColumn } from "../../data_handling/multidimensional_dataset";
import { Accessors } from "../types";
import RowHeader from "./RowHeader";

interface Props {
  accessors: Accessors;
  dimensions: DimensionWithPrimitiveAndMetadata[];
  rows: RowOrColumn[];
  rowHeaderWidth: (dimension: DimensionWithPrimitiveAndMetadata) => number;
}

const RowHeaderBlock: React.SFC<Props> = ({ accessors, dimensions, rows, rowHeaderWidth }) => (
  <div style={{ float: "left" }}>
    {dimensions.map((dimension, i) => (
      <RowHeader
        width={rowHeaderWidth(dimension)}
        accessors={accessors}
        dimension={dimension}
        rows={rows}
        dimensionIndex={i}
        key={i}
      />
    ))}
  </div>
);

export default RowHeaderBlock;
