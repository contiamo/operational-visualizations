import { area } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction } from "./utils";

export const Area: LinearAxialChart<string> = props => {
  const defaultTransform = useChartTransform();

  const { metricDirection, data, transform, metric, categorical, metricScale, categoricalScale, stack, style } = props;

  // The categorical scale must be a band scale for composability with bar charts.
  // Half of the tick width must be added to align with the ticks.
  const categoricalTickWidth = categoricalScale.bandwidth();

  const accumulatedCache: Record<string, number> = {};

  const path = metricDirection === "vertical"
    ? area<{ c: string; m0: number; m1: number }>()
        .x(d => categoricalTickWidth / 2 + (categoricalScale(d.c) || 0))
        .y0(d => metricScale(d.m0))
        .y1(d => metricScale(d.m1))
    : area<{ c: string; m0: number; m1: number }>()
        .x0(d => metricScale(d.m0))
        .x1(d => metricScale(d.m1))
        .y(d => categoricalTickWidth / 2 + (categoricalScale(d.c) || 0));

  return (
    <g transform={transform || defaultTransform}>
      {data.groupBy(stack || [])
        .map((grouped, i) => {
          const pathData = grouped.mapRows(row => {
            const metricValue = metric(row);
            const accumulatedValue = accumulatedCache[categorical(row)] || 0;
            const newAccumulatedValue = accumulatedValue + metricValue
            accumulatedCache[categorical(row)] = newAccumulatedValue
            return {
              c: categorical(row),
              m0: accumulatedValue,
              m1: newAccumulatedValue,
            }
          });

          return <path
            d={path(pathData) || ""}
            style={isFunction(style) ? style(grouped.row(0), i) : style}
          />
        })
      }
    </g>
  );
};
