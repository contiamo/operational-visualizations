import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;

  if (props.metricDirection === "vertical") {
    const height = metricScale(metricScale.domain()[0]);
    let accumulatedHeight = 0;

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const bar = (
            <rect
              x={categoricalScale(categorical(row))}
              y={metricScale(metric(row)) - accumulatedHeight}
              width={categoricalScale.bandwidth()}
              height={height - metricScale(metric(row))}
              style={isFunction(style) ? style(row, i) : style}
              key={i}
            />
          );
          accumulatedHeight += height - metricScale(metric(row));
          return bar;
        })}
      </g>
    );
  } else {
    let accumulatedWidth = 0;

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const bar = (
            <rect
              y={categoricalScale(categorical(row))}
              x={accumulatedWidth}
              height={categoricalScale.bandwidth()}
              width={metricScale(metric(row))}
              style={isFunction(style) ? style(row, i) : style}
              key={i}
            />
          );
          accumulatedWidth += metricScale(metric(row));
          return bar;
        })}
      </g>
    );
  }
};
