import React from "react";
import { headerStyle } from "../styles";
import { DimensionHeaderAccessors } from "../types";

import {
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
} from "../../data_handling/multidimensional_dataset";

interface Props {
  accessors: DimensionHeaderAccessors;
  dimension: DimensionWithPrimitiveAndMetadata | DimensionWithValueAndMetadata;
  width: number;
}

const titleStyle = ({ accessors, dimension, width }: Props): React.CSSProperties => {
  const height = accessors.lineHeight(dimension);
  return {
    ...headerStyle,
    height,
    width,
    lineHeight: `${height}px`,
    float: "left",
    color: accessors.color(dimension),
    backgroundColor: accessors.backgroundColor(dimension),
    borderColor: accessors.borderColor(dimension),
  };
};

const ColumnLabel: React.SFC<Props> = props => (
  <div style={titleStyle(props)}>{props.accessors.value(props.dimension)}</div>
);

export default ColumnLabel;
