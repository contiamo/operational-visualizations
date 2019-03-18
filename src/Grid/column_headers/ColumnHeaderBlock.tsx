import React from "react";
import { DimensionWithPrimitiveAndMetadata, RowOrColumn } from "../../data_handling/multidimensional_dataset";
import { Accessors } from "../types";
import ColumnHeader from "./ColumnHeader";

interface Props {
  accessors: Accessors;
  columns: RowOrColumn[];
  dimensions: DimensionWithPrimitiveAndMetadata[];
  marginLeft: number;
  width: number;
}

const ColumnHeaderBlock: React.SFC<Props> = ({ accessors, columns, dimensions, width, marginLeft }) => (
  <div style={{ float: "left", width, marginLeft }}>
    {dimensions.map((dimension, i) => (
      <ColumnHeader
        width={width}
        accessors={accessors}
        dimension={dimension}
        columns={columns}
        dimensionIndex={i}
        key={i}
      />
    ))}
  </div>
);

export default ColumnHeaderBlock;
