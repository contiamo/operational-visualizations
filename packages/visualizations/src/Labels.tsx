import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import theme from "./theme";
import { isScaleBand, isScaleContinuous } from "./scale";

export const baseStyle: React.CSSProperties = {
  fontSize: theme.font.size.small,
  fill: theme.font.color,
};

export const verticalStyle: React.CSSProperties = {
  ...baseStyle,
  textAnchor: "middle",
};

export const Labels: DiscreteAxialChart<string> = ({ data, transform, x, y, xScale, yScale, style }) => {
  const defaultTransform = useChartTransform();

  if (isScaleBand(xScale) && isScaleContinuous(yScale)) {
    const bandWidth = xScale.bandwidth();
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <text
            x={(xScale(x(row)) || 0) + bandWidth / 2}
            y={yScale(y(row))}
            dy="-0.35em"
            style={{
              ...verticalStyle,
              ...(isFunction(style) ? style(row, i) : style),
            }}
            key={i}
          >
            {y(row)}
          </text>
        ))}
      </g>
    );
  } else if (isScaleBand(yScale) && isScaleContinuous(xScale)) {
    const bandWidth = yScale.bandwidth();
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <text
            x={xScale(x(row))}
            y={(yScale(y(row)) || 0) + bandWidth / 2}
            dx="0.35em"
            dy="0.35em"
            style={{
              ...baseStyle,
              ...(isFunction(style) ? style(row, i) : style),
            }}
            key={i}
          >
            {x(row)}
          </text>
        ))}
      </g>
    );
  } else {
    throw new Error("Unsupported case of scales");
  }
};
