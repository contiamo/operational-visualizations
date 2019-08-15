import { area, line } from "d3-shape";
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

    const strokePath = metricDirection === "vertical"
      ? line<{ c: string; m0: number; m1: number }>()
        .x(d => categoricalTickWidth / 2 + (categoricalScale(d.c) || 0))
        .y(d => metricScale(d.m1))
      : line<{ c: string; m0: number; m1: number }>()
        .x(d => metricScale(d.m1))
        .y(d => categoricalTickWidth / 2 + (categoricalScale(d.c) || 0))

  const missingDatum = (tick: string) => {
    const d = []
    d[categorical.index] = tick;
    d[metric.index] = undefined;
    return d
  }

  const stackedData = data
    .groupBy(stack || [])
    .map((grouped) => {
      const rawPathData = grouped.mapRows(row => row)

      // Add missing data
      const ticks = categoricalScale.domain()
      const dataWithMissing = ticks.map(tick => {
        const datum = rawPathData.find(d => categorical(d) === tick)
        return datum || missingDatum(tick)
      }).sort(d => ticks.indexOf(categorical(d)))

      // Stack
      return {
        data: dataWithMissing.map(row => {
          const metricValue = metric(row);
          const accumulatedValue = accumulatedCache[categorical(row)] || 0;
          accumulatedCache[categorical(row)] = accumulatedValue + (metricValue || 0)
          return {
            c: categorical(row),
            m0: accumulatedValue,
            m1: metricValue ? accumulatedValue + metricValue : undefined,
          }
        }),
        firstRow: grouped.row(0)
      }
    });

  return (
    <g transform={transform || defaultTransform}>
      {/* Render area segments */}
      {stackedData.map((stack, i) =>
        <path
          key={`Area-${i}`}
          d={path.defined(d => isDefined(d.m1))(stack.data) || ""}
          style={{
            strokeLinecap: "round",
            ...(isFunction(style) ? style(stack.firstRow, i) : style),
          }}
        />
      )}
      {/* Render white lines between each area segment. This is done afterwards to ensure the lines are visible */}
      {stackedData.map((stack, i) =>
        <path
          key={`Line-${i}`}
          d={strokePath.defined(d => isDefined(d.m1))(stack.data) || ""}
          style={{ stroke: "#fff", fill: "none" }}
        />
      )}
    </g>
  );
};
