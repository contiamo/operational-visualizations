import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";

const radius = 3;

export const Dots: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;

  const bandWidth = categoricalScale.bandwidth();

  // this doesn't make much sense for ScatterPlot, but this is temprorary solution for compatibility
  if (props.metricDirection === "vertical") {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <circle
            cx={categoricalScale(categorical(row))! + bandWidth / 2}
            cy={metricScale(metric(row))}
            r={radius}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <circle
            cx={metricScale(metric(row))}
            cy={categoricalScale(categorical(row))! + bandWidth / 2}
            r={radius}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        ))}
      </g>
    );
  }
};
