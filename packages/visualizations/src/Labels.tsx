import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import theme from "./theme";
import { ColumnCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { isScaleBand } from "./scale";

export const baseStyle: React.CSSProperties = {
  fontSize: theme.font.size.small,
  fill: theme.font.color,
};

export const verticalStyle: React.CSSProperties = {
  ...baseStyle,
  textAnchor: "middle",
};

export const Labels: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, x, y, xScale, yScale, style } = props;
  const [categorical, metric, categoricalScale, metricScale, metricDirection]: [
    ColumnCursor<string>,
    ColumnCursor<string>,
    ScaleBand<string>,
    ScaleLinear<number, number>,
    "vertical" | "horizontal"
  ] = isScaleBand(xScale) ? [x, y, xScale, yScale, "horizontal"] : ([y, x, yScale, xScale, "vertical"] as any);

  const bandWidth = categoricalScale.bandwidth();

  if (metricDirection === "vertical") {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <text
            x={categoricalScale(categorical(row))! + bandWidth / 2}
            y={metricScale(metric(row))}
            dy="-0.35em"
            style={{
              ...verticalStyle,
              ...(isFunction(style) ? style(row, i) : style),
            }}
            key={i}
          >
            {metric(row)}
          </text>
        ))}
      </g>
    );
  } else {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <text
            x={metricScale(metric(row))}
            y={categoricalScale(categorical(row))! + bandWidth / 2}
            dx="0.35em"
            dy="0.35em"
            style={{
              ...baseStyle,
              ...(isFunction(style) ? style(row, i) : style),
            }}
            key={i}
          >
            {metric(row)}
          </text>
        ))}
      </g>
    );
  }
};
