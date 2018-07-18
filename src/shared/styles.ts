import { css } from "glamor"
import theme from "../utils/constants"

// Canvas
const drawingContainerStyle = {
  fontSize: "11px",
  position: "relative",
  overflow: "hidden",
}

const chartContainerStyle = {
  position: "relative",
  display: "block",
  backgroundColor: theme.colors.white,
  "&.hidden": {
    display: "none",
  },
}

// Legends
const legendStyle = {
  padding: `${theme.space.small}px ${theme.space.default}px`
}

const seriesLegendStyle = {
  padding: `2px ${theme.space.small}`,
  "& div.color": {
    width: 10,
    height: 10,
    marginRight: theme.space.small,
    float: "left",
    borderRadius: 2,
  },
  "& div.name": {
    float: "left",
    fontSize: theme.font.size.default,
    fontWeight: theme.font.weight.regular,
    lineHeight: 1,
  },
}

// Axes
const rulesStyle = {
  stroke: theme.colors.axis.rules,
  strokeWidth: 1,
  shapeRendering: "crispedges",
  "& .zero": {
    strokeWidth: 2,
  },
  "& .now": {
    stroke: theme.colors.primary,
    strokeDasharray: "2, 4",
  },
}

const axisLabelStyle = {
  fill: theme.colors.axis.label,
  fontFamily: theme.font.family,
  "&.weekend": {
    fill: "#9d261d",
  },
  "&.now": {
    fill: theme.colors.primary,
  },
}

const axisBorderStyle = {
  stroke: theme.colors.axis.border,
  shapeRendering: "crispedges",
}

const axisTickStyle = {
  stroke: theme.colors.axis.border,
  strokeWidth: 1,
  shapeRendering: "crispedges",
  "&.zero": {
    strokeWidth: 2,
  },
}

// Focus
const componentRectStyle = {
  opacity: 0,
}

const componentFocusStyle = {
  position: "absolute",
  pointerEvents: "all",
  backgroundColor: "rgba(0, 74, 117, 0.05)",
  borderRadius: theme.borderRadius,
  border: 0,
  padding: 0,
  cursor: "pointer",
  maxWidth: "initial",
}

const focusLegendStyle = {
  userSelect: "none",
  pointerEvents: "none",
  boxSizing: "content-box",
  padding: "4px 8px",
  border: "1px solid #cdcdcd",
  position: "absolute",
  zIndex: 3000,
  maxWidth: "350px",
  backgroundColor: "#fff",
  borderRadius: theme.borderRadius,
  "& ul": {
    listStyle: "none",
    fontSize: 12,
    margin: 0,
    padding: 0,
  },
  "& li.title, span.title": {
    fontWeight: "bold",
  },
  "& span.title": {
    paddingRight: "6px",
  },
  "&::before,::after": {
    content: "''",
    position: "absolute",
    width: 0,
    height: 0,
  },
}

const focusLegendAboveStyle = {
  position: "absolute",
  borderLeft: "solid 8px transparent",
  borderRight: "solid 8px transparent",
  borderTop: "solid 8px #cdcdcd",
  marginLeft: "-8px",
  marginTop: "-2px",
  "& div.arrowFill": {
    position: "absolute",
    borderLeft: "solid 7px transparent",
    borderRight: "solid 7px transparent",
    borderTop: "solid 7px #fff",
    marginLeft: "-7px",
    marginTop: "-9px",
  },
}

const focusLegendBelowStyle = {
  position: "absolute",
  borderLeft: "solid 8px transparent",
  borderRight: "solid 8px transparent",
  borderBottom: "solid 8px #cdcdcd",
  marginLeft: "-8px",
  marginTop: "-8px",
  "& div.arrowFill": {
    position: "absolute",
    borderLeft: "solid 7px transparent",
    borderRight: "solid 7px transparent",
    borderBottom: "solid 7px #fff",
    marginLeft: "-7px",
    marginTop: "1px",
  },
}

const focusLegendRightStyle = {
  position: "absolute",
  borderTop: "solid 8px transparent",
  borderBottom: "solid 8px transparent",
  borderRight: "solid 8px #cdcdcd",
  marginTop: "-8px",
  marginLeft: "-8px",
  "& div.arrowFill": {
    position: "absolute",
    borderTop: "solid 7px transparent",
    borderBottom: "solid 7px transparent",
    borderRight: "solid 7px #fff",
    marginTop: "-7px",
    marginLeft: "1px",
  },
}

const focusLegendLeftStyle = {
  position: "absolute",
  borderTop: "solid 8px transparent",
  borderBottom: "solid 8px transparent",
  borderLeft: "solid 8px #cdcdcd",
  marginTop: "-8px",
  marginLeft: "-2px",
  "& div.arrowFill": {
    position: "absolute",
    borderTop: "solid 7px transparent",
    borderBottom: "solid 7px transparent",
    borderLeft: "solid 7px #fff",
    marginTop: "-7px",
    marginLeft: "-9px",
  },
}

export const chartContainer = css(chartContainerStyle).toString()
export const focusLegend = css(focusLegendStyle).toString()
export const focusLegendAbove = css(focusLegendAboveStyle).toString()
export const focusLegendBelow = css(focusLegendBelowStyle).toString()
export const focusLegendRight = css(focusLegendRightStyle).toString()
export const focusLegendLeft = css(focusLegendLeftStyle).toString()
export const legend = css(legendStyle).toString()
export const seriesLegend = css(seriesLegendStyle).toString()
export const drawingContainer = css(drawingContainerStyle).toString()
export const rules = css(rulesStyle).toString()
export const axisLabel = css(axisLabelStyle).toString()
export const axisBorder = css(axisBorderStyle).toString()
export const axisTick = css(axisTickStyle).toString()
export const componentRect = css(componentRectStyle).toString()
export const componentFocus = css(componentFocusStyle).toString()
