import { AxisConfig, AxisPosition, AxisType } from "./typings";

const generalAxisConfig = (type: AxisType) => ({
  type,
  fontSize: 11,
  hideAxis: false,
  tickLength: 5,
  titleFontSize: 12,
  showTicks: true,
  showLabels: true,
  showRules: type === "quant",
  outerPadding: 3,
  rotateLabels: false,
  margin: 0,
});

const xAxisConfig = {
  minTicks: 2,
  tickSpacing: 65,
};

const yAxisConfig = {
  minTicks: 4,
  minTopOffsetTopTick: 21,
  tickSpacing: 40,
};

export const defaultMargins = (noAxisMargin: number) => ({
  x1: noAxisMargin,
  x2: noAxisMargin,
  y1: noAxisMargin,
  y2: noAxisMargin,
});

export default (type: AxisType, axis: AxisPosition): AxisConfig => ({
  labelOffset: ["x1", "y2"].includes(axis) ? 8 : -8,
  ...generalAxisConfig(type),
  ...(axis[0] === "x" ? xAxisConfig : yAxisConfig),
});
