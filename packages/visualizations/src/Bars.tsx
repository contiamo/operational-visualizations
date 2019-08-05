import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();

  if (props.metricDirection === "vertical") {
    const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;
    const height = metricScale(metricScale.domain()[0]);
    let accumulatedHeight = 0;

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const result = (
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
          return result;
        })}
      </g>
    );
  } else {
    const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;
    let accumulatedWidth = 0;

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const result = (
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
          return result;
        })}
      </g>
    );
  }
};
