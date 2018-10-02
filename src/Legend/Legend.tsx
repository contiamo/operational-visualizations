import * as React from "react"
import theme from "../utils/constants"

const legendStyle: React.CSSProperties = {
  padding: `${theme.space.small}px ${theme.space.default}px`,
  float: "left",
  color: theme.font.color,
  fontSize: theme.font.size.default,
}

const seriesLegendStyle: React.CSSProperties = {
  padding: `2px ${theme.space.small}px`,
  float: "left",
}

const colorStyle = (color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  marginRight: theme.space.small,
  marginTop: (theme.font.size.default - 10) / 2,
  float: "left",
  borderRadius: 2,
  backgroundColor: color,
})

const nameStyle: React.CSSProperties = {
  float: "left",
  fontWeight: theme.font.weight.regular,
  lineHeight: 1,
}

const titleStyle: React.CSSProperties = {
  fontWeight: theme.font.weight.bold,
}

interface LegendDatum {
	label: string
	color: string
  key: string
}

type LegendData = LegendDatum[]

export interface Props {
  style?: {}
  title?: string
  data: LegendData
}

const Legend = (props: Props) => (
  <div style={{...props.style, ...legendStyle}}>
    {props.title && <div style={titleStyle}>{props.title}</div>}
    {props.data.map((datum: LegendDatum) => {
      return <div className={datum.key} style={seriesLegendStyle}>
        <div style={colorStyle(datum.color)}></div>
        <div style={nameStyle}>{datum.label}</div>
      </div>
    })}
  </div>
)

export default Legend
