import React from "react";
import theme from "../../utils/constants";
import { SingleAxis } from "../types";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface Props {
  axes: SingleAxis[];
  backgroundColor?: string;
  width?: number;
  marginLeft?: number;
}

const axisBlockStyle = ({ backgroundColor, marginLeft, width }: Omit<Props, "axes">): React.CSSProperties => ({
  float: "left",
  backgroundColor,
  marginLeft,
  width,
});

const AxisBlock: React.SFC<Props> = ({ axes, ...props }: Props) => (
  <div style={axisBlockStyle(props)}>{axes.map((axis, i) => axis.draw(i))}</div>
);

AxisBlock.defaultProps = {
  backgroundColor: theme.colors.white,
  marginLeft: 0,
};

export default AxisBlock;
