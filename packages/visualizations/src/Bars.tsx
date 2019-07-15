import React from "react";
import { useChartTransform } from "./Chart";
import { DiscreteAxialChart } from "./types";
import { isFunction } from "./utils";
import { RawRow } from "@operational/frame";

export const Bars: DiscreteAxialChart<string> = props => {
  const defaultTransform = useChartTransform();
  const { data, transform, metric, categorical, metricScale, categoricalScale, style } = props;
  let value = 0;
  let prevRow: RawRow;
  const stackRow = (row: RawRow) => {
    value =
      prevRow && categorical(prevRow) === categorical(row)
        ? value + metric(prevRow)
        : 0;
    prevRow = row;
  };

  if (props.metricDirection === "vertical") {
    const height = metricScale(metricScale.domain()[0]);
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          stackRow(row);
          return (
            <rect
              x={categoricalScale(categorical(row))}
              y={metricScale(metric(row) + value)}
              width={categoricalScale.bandwidth()}
              height={height - metricScale(metric(row))}
              style={isFunction(style) ? style(row, i) : style}
              key={i}
            />
          );
        })}
      </g>
    );
  } else {
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          stackRow(row);
          return (
            <rect
              y={categoricalScale(categorical(row))}
              x={metricScale(value)}
              height={categoricalScale.bandwidth()}
              width={metricScale(metric(row))}
              style={isFunction(style) ? style(row, i) : style}
              key={i}
            />
          );
        })}
      </g>
    );
  }
};
