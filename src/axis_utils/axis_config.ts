import { AxisType, AxisPosition, AxisConfig } from "./typings";

const generalAxisConfig = (type: AxisType) => ({
  type,
  fontSize: 11,
  titleFontSize: 12,
  showTicks: true,
  showLabels: true,
  showRules: type === "quant",
})

const xAxisConfig = {
  margin: 15,
  minTicks: 2,
  rotateLabels: false,
  tickSpacing: 65,
  outerPadding: 3,
}

const yAxisConfig = {
  margin: 34,
  minTicks: 4,
  minTopOffsetTopTick: 21,
  rotateLabels: false,
  tickSpacing: 40,
  outerPadding: 3,
}

export const defaultMargins = {
  x1: xAxisConfig.margin,
  x2: xAxisConfig.margin,
  y1: yAxisConfig.margin,
  y2: yAxisConfig.margin,
}

export default (type: AxisType, axis: AxisPosition): AxisConfig => ({
  tickOffset: ["x1", "y2"].includes(axis) ? 8 : -8,
  ...generalAxisConfig(type),
  ...(axis[0] === "x" ? xAxisConfig : yAxisConfig)
})
