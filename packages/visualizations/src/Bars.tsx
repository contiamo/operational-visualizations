import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import { baseStyle as baseLabelStyle, verticalStyle as verticalLabelStyle } from "./Labels";
import { isScaleBand } from "./scale";

export const Bars: DiscreteAxialChart<string> = ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
  const defaultTransform = useChartTransform();

  if (isScaleBand(xScale)) {
    const height = yScale(yScale.domain()[0] as any)!;
    const bandWidth = xScale.bandwidth();
    let accumulatedHeight = 0;
    // The `Labels` component can't be used here due to stacking
    // labels need to be computed per row, but then rendered at the end to avoid being hidden by stacked bar segments
    const labels: JSX.Element[] = [];

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const bar = (
            <rect
              x={xScale(x(row))}
              y={(yScale(y(row)) as number) - accumulatedHeight}
              width={xScale.bandwidth()}
              height={height - (yScale(y(row)) as number)}
              style={isFunction(style) ? style(row, i) : style}
              key={`bar-${i}`}
            />
          );
          const label = (
            <text
              x={xScale(x(row))! + bandWidth / 2}
              y={(yScale(y(row)) as number) - accumulatedHeight}
              dy="-0.35em"
              style={verticalLabelStyle}
              key={`label-${i}`}
            >
              {y(row)}
            </text>
          );
          labels.push(label);
          accumulatedHeight += height - (yScale(y(row)) as number);
          return bar;
        })}
        {showLabels && labels}
      </g>
    );
  } else if (isScaleBand(yScale)) {
    let accumulatedWidth = 0;
    const bandWidth = yScale.bandwidth();
    // The `Labels` component can't be used here due to stacking
    // labels need to be computed per row, but then rendered at the end to avoid being hidden by stacked bar segments
    const labels: JSX.Element[] = [];
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const bar = (
            <rect
              x={accumulatedWidth}
              y={yScale(y(row))}
              height={yScale.bandwidth()}
              width={xScale(x(row))}
              style={isFunction(style) ? style(row, i) : style}
              key={`bar-${i}`}
            />
          );
          const label = (
            <text
              x={xScale(x(row)) + accumulatedWidth}
              y={yScale(y(row))! + bandWidth / 2}
              dx="0.35em"
              dy="0.35em"
              style={baseLabelStyle}
              key={`label-${i}`}
            >
              {x(row)}
            </text>
          );
          labels.push(label);
          accumulatedWidth += xScale(x(row));
          return bar;
        })}
        {showLabels && labels}
      </g>
    );
  } else {
    throw new Error("Unsupported case of scales");
  }
};
