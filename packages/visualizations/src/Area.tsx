import { area, line } from "d3-shape";
import React, { useMemo } from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction, fillHoles } from "./utils";
import { baseStyle as baseLabelStyle, verticalStyle as verticalLabelStyle } from "./Labels";
import { isScaleBand, isScaleContinuous } from "./scale";
import { GroupFrame, ColumnCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

const useFillHoles = (
  data: GroupFrame<string>,
  x: ColumnCursor<string>,
  y: ColumnCursor<string>,
  xScale: ScaleBand<string> | ScaleLinear<number, number>,
  yScale: ScaleBand<string> | ScaleLinear<number, number>,
) =>
  useMemo(
    () =>
      data.map(grouped => ({
        data: fillHoles(grouped, x, y, xScale, yScale),
        firstRow: grouped.row(0),
      })),
    [data, x, y, xScale, yScale],
  );

const isDefined = (value: number | undefined) => value !== undefined;

export const Area: LinearAxialChart<string> = ({ data, transform, x, y, xScale, yScale, stack, showLabels, style }) => {
  const defaultTransform = useChartTransform();

  const accumulatedCache: Record<string, number> = {};

  const dataWithMissing = useFillHoles(data.groupBy(stack || []), x, y, xScale, yScale);

  if (isScaleBand(xScale) && isScaleContinuous(yScale)) {
    // The categorical scale must be a band scale for composability with bar charts.
    // Half of the tick width must be added to align with the ticks.
    const categoricalTickWidth = xScale.bandwidth();

    // The area path function takes an array of datum objects (here, called `d` for consistency with d3 naming conventions)
    // with the following properties:
    // `c` is the categorical tick value
    // `m0` and `m1` are the lower and upper metric values
    const path = area<{ c: string; m0: number; m1: number }>()
      .x(d => categoricalTickWidth / 2 + (xScale(d.c) || 0))
      .y0(d => yScale(d.m0))
      .y1(d => yScale(d.m1));

    const strokePath = line<{ c: string; m0: number; m1: number }>()
      .x(d => categoricalTickWidth / 2 + (xScale(d.c) || 0))
      .y(d => yScale(d.m1));

    const stackedData = dataWithMissing.map(row => ({
      data: row.data.map(row => {
        const metricValue = y(row);
        const accumulatedValue = accumulatedCache[x(row)] || 0;
        accumulatedCache[x(row)] = accumulatedValue + (metricValue || 0);
        return {
          c: x(row),
          m0: accumulatedValue,
          m1: isDefined(metricValue) ? accumulatedValue + metricValue : undefined,
        };
      }),
      firstRow: row.firstRow,
    }));

    return (
      <g transform={transform || defaultTransform}>
        {/* Render area segments */}
        {stackedData.map((stack, i) => (
          <path
            key={`Area-${i}`}
            d={path.defined(d => isDefined(d.m1))(stack.data) || ""}
            style={{
              strokeLinecap: "round",
              ...(isFunction(style) ? style(stack.firstRow, i) : style),
            }}
          />
        ))}
        {/* Render white lines between each area segment. This is done afterwards to ensure the lines are visible */}
        {stackedData.map((stack, i) => (
          <path
            key={`Line-${i}`}
            d={strokePath.defined(d => isDefined(d.m1))(stack.data) || ""}
            style={{ stroke: "#fff", fill: "none" }}
          />
        ))}
        {/* Render text labels. This is done at the end to ensure they are visible */}
        {showLabels &&
          stackedData.map((stack, i) =>
            stack.data.map((d, j) => (
              <text
                key={`Label-${i}-${j}`}
                x={(xScale(d.c) || 0) + categoricalTickWidth / 2}
                y={yScale(d.m1)}
                dy="-0.35em"
                style={verticalLabelStyle}
              >
                {isDefined(d.m1) && isDefined(d.m0) ? d.m1 - d.m0 : ""}
              </text>
            )),
          )}
      </g>
    );
  } else if (isScaleBand(yScale) && isScaleContinuous(xScale)) {
    const categoricalTickWidth = yScale.bandwidth();

    const path = area<{ c: string; m0: number; m1: number }>()
      .x0(d => xScale(d.m0))
      .x1(d => xScale(d.m1))
      .y(d => categoricalTickWidth / 2 + (yScale(d.c) || 0));

    const strokePath = line<{ c: string; m0: number; m1: number }>()
      .x(d => xScale(d.m1))
      .y(d => categoricalTickWidth / 2 + (yScale(d.c) || 0));

    const stackedData = dataWithMissing.map(row => ({
      data: row.data.map(row => {
        const metricValue = x(row);
        const accumulatedValue = accumulatedCache[y(row)] || 0;
        accumulatedCache[y(row)] = accumulatedValue + (metricValue || 0);
        return {
          c: y(row),
          m0: accumulatedValue,
          m1: isDefined(metricValue) ? accumulatedValue + metricValue : undefined,
        };
      }),
      firstRow: row.firstRow,
    }));

    return (
      <g transform={transform || defaultTransform}>
        {/* Render area segments */}
        {stackedData.map((stack, i) => (
          <path
            key={`Area-${i}`}
            d={path.defined(d => isDefined(d.m1))(stack.data) || ""}
            style={{
              strokeLinecap: "round",
              ...(isFunction(style) ? style(stack.firstRow, i) : style),
            }}
          />
        ))}
        {/* Render white lines between each area segment. This is done afterwards to ensure the lines are visible */}
        {stackedData.map((stack, i) => (
          <path
            key={`Line-${i}`}
            d={strokePath.defined(d => isDefined(d.m1))(stack.data) || ""}
            style={{ stroke: "#fff", fill: "none" }}
          />
        ))}
        {/* Render text labels. This is done at the end to ensure they are visible */}
        {showLabels &&
          stackedData.map((stack, i) =>
            stack.data.map((d, j) => (
              <text
                key={`Label-${i}-${j}`}
                x={xScale(d.m1)}
                y={(yScale(d.c) || 0) + categoricalTickWidth / 2}
                dx="0.35em"
                dy="0.35em"
                style={baseLabelStyle}
              >
                {isDefined(d.m1) && isDefined(d.m0) ? d.m1 - d.m0 : ""}
              </text>
            )),
          )}
      </g>
    );
  } else {
    throw new Error("Unsupported case of scales");
  }
};
