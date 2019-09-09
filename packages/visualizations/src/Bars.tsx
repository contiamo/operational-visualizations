import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import { baseStyle as baseLabelStyle, verticalStyle as verticalLabelStyle } from "./Labels";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, metric, categorical, metricScale, categoricalScale, displayLabels, style } = props;
  const bandWidth = categoricalScale.bandwidth();

  if (props.metricDirection === "vertical") {
    const height = metricScale(metricScale.domain()[0]);
    let accumulatedHeight = 0;
    // The `Labels` component can't be used here due to stacking
    // labels need to be computed per row, but then rendered at the end to avoid being hidden by stacked bar segments
    const labels: JSX.Element[] = []

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
              key={`bar-${i}`}
            />
          );
          const label = (
            <text
              x={categoricalScale(categorical(row))! + bandWidth / 2}
              y={metricScale(metric(row)) - accumulatedHeight}
              dy={"-0.35em"}
              style={verticalLabelStyle}
              key={`label-${i}`}
            >
              {metric(row)}
            </text>
          )
          labels.push(label)
          accumulatedHeight += height - metricScale(metric(row));
          return bar;
        })}
        {displayLabels && labels}
      </g>
    );
  } else {
    let accumulatedWidth = 0;
    // The `Labels` component can't be used here due to stacking
    // labels need to be computed per row, but then rendered at the end to avoid being hidden by stacked bar segments
    const labels: JSX.Element[] = []
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
              key={`bar-${i}`}
            />
          );
          const label = (
            <text
              x={metricScale(metric(row)) + accumulatedWidth}
              y={categoricalScale(categorical(row))! + bandWidth / 2}
              dx={4}
              dy={"0.35em"}
              style={baseLabelStyle}
              key={`label-${i}`}
            >
              {metric(row)}
            </text>
          )
          labels.push(label)
          accumulatedWidth += metricScale(metric(row));
          return bar;
        })}
        {displayLabels && labels}
      </g>
    );
  }
};
