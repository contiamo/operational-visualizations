import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import { stackRowBy } from "@operational/frame";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;

  const stackRow = stackRowBy(categorical, metric)

  if (props.metricDirection === "vertical") {
    const height = metricScale(metricScale.domain()[0]);
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) =>
          <rect
            x={categoricalScale(categorical(row))}
            y={metricScale(metric(row) + stackRow(row))}
            width={categoricalScale.bandwidth()}
            height={height - metricScale(metric(row))}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        )}
      </g>
    );
  } else {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) =>
          <rect
            y={categoricalScale(categorical(row))}
            x={metricScale(stackRow(row))}
            height={categoricalScale.bandwidth()}
            width={metricScale(metric(row))}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        )}
      </g>
    );
  }
};
