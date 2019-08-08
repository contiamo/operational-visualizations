import * as React from "react"
import theme from "./theme"
import { IterableFrame, RowCursor, ColumnCursor } from "@operational/frame";
import { joinArrayAsString } from "./utils";

const legendStyle: React.CSSProperties = {
  padding: `${theme.space.small}px ${theme.space.default}px`,
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
  padding: `2px ${theme.space.small}px`,
}

export interface Props<Name extends string> {
  data: IterableFrame<Name>;
  colorScale: (() => string) | ((row: RowCursor) => string);
  cursors: Array<ColumnCursor<Name>>;
  style?: {}
  title?: string
}

export const Legend = (props: Props<string>) => {
  const uniqueValues = props.data.uniqueValues(props.cursors)
  if (uniqueValues.length === 0 || props.colorScale.length === 0) { return null }
  return <div style={{...props.style, ...legendStyle}}>
    {props.title && <div style={titleStyle}>{props.title}</div>}
    {props.data.groupBy(props.cursors).map((grouped, i) =>
      <div style={seriesLegendStyle} key={i}>
        <div style={colorStyle(props.colorScale(grouped.row(0)))}></div>
        <div style={nameStyle}>{joinArrayAsString(props.cursors.map(cursor => cursor(grouped.row(0))))}</div>
      </div>
    )}
  </div>
}
