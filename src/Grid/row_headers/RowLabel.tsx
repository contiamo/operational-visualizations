import React from "react";
import theme from "../../utils/constants";
import { headerStyle } from "../styles";
import { DimensionHeaderAccessors } from "../types";

import {
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
} from "../../data_handling/multidimensional_dataset";

interface Props {
  accessors: DimensionHeaderAccessors;
  dimension: DimensionWithPrimitiveAndMetadata | DimensionWithValueAndMetadata;
  height: number;
  width: number;
  isHorizontal: boolean;
}

const titleStyle = ({ accessors, dimension, height, width, isHorizontal }: Props): React.CSSProperties => ({
  ...headerStyle,
  height,
  width,
  lineHeight: `${accessors.lineHeight(dimension)}px`,
  color: accessors.color(dimension),
  backgroundColor: accessors.backgroundColor(dimension),
  borderColor: accessors.borderColor(dimension),
  ...(isHorizontal
    ? {
        textAlign: "start",
      }
    : {
        padding: 0,
        float: "left",
      }),
});

const verticalTextStyle = ({ accessors, dimension, height }: Props): React.CSSProperties => ({
  width: height,
  height: accessors.lineHeight(dimension),
  margin: 0,
  transform: `rotate(-90deg) translate(0px, -${height}px)`,
  transformOrigin: "right top",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  padding: `0 ${theme.space.default}px`,
});

const RowLabel: React.SFC<Props> = props => {
  const { accessors, dimension, isHorizontal } = props;
  const labelText = accessors.value(dimension);
  return (
    <div style={titleStyle(props)}>
      {isHorizontal ? labelText : <p style={verticalTextStyle(props)}>{labelText}</p>}
    </div>
  );
};

export default RowLabel;
