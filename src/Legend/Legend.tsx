import * as React from "react"
import theme from "../utils/constants"

const legendStyle: React.CSSProperties = {
  padding: `${theme.space.small}px ${theme.space.default}px`,
  float: "left",
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
  fontSize: theme.font.size.default,
  fontWeight: theme.font.weight.regular,
  lineHeight: 1,
}

interface LegendDatum {
	label: string
	color: string
  key: string
}

type LegendData = LegendDatum[]

export interface Props {
  style?: {}
  data: LegendData
}

class Legend extends React.Component<Props, {}> {
  render() {
    return (
      <div style={{...this.props.style, ...legendStyle}}>
        {this.props.data.map(datum => {
          return <div className={datum.key} style={seriesLegendStyle}>
            <div style={colorStyle(datum.color)}></div>
            <div style={nameStyle}>{datum.label}</div>
          </div>
        })}
      </div>
    )
  }
}

export default Legend
