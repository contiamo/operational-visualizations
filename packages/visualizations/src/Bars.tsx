import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();

  if (props.metricDirection === "vertical") {
    const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;
    const height = metricScale(metricScale.domain()[0]);

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            x={categoricalScale(categorical(row))}
            y={metricScale(metric(row))}
            width={categoricalScale.bandwidth()}
            height={height - metricScale(metric(row))}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            y={categoricalScale(categorical(row))}
            x={0}
            height={categoricalScale.bandwidth()}
            width={metricScale(metric(row))}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        ))}
      </g>
    );
  }
};
