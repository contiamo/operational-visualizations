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

  const isDefined = (value: number | undefined) => value !==undefined;

  // The area path function takes an array of datum objects (here, called `d` for consistency with d3 naming conventions)
  // with the following properties:
  // `c` is the categorical tick value
  // `m0` and `m1` are the lower and upper metric values
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
            accumulatedCache[categorical(row)] = accumulatedValue + (metricValue || 0)
            return {
              c: categorical(row),
              m0: accumulatedValue,
              m1: metricValue ? accumulatedValue + metricValue : undefined,
            }
          });

          return <path
            key={i}
            d={path.defined(d => isDefined(d.m1))(pathData) || ""}
            style={{
              strokeLinecap: "round",
              ...(isFunction(style) ? style(grouped.row(0), i) : style),
            }}
          />
        })
      }
    </g>
  );
};
