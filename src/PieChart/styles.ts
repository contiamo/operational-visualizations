import { css } from "glamor"
import { seriesLegend } from "../shared/styles"

const comparisonLegendLineStyle = {
  width: "4px",
  height: "0px",
  border: "1px solid #747474",
  margin: "5px 3px 3px 3px",
  float: "left",
}

export const comparisonLegend = seriesLegend
export const comparisonLegendLine = css(comparisonLegendLineStyle).toString()
