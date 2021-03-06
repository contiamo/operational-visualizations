import { line } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction } from "./utils";
import { Labels } from "./Labels";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { ColumnCursor } from "@operational/frame";
import { isScaleBand, isScaleContinuous } from "./scale";

export const Line: LinearAxialChart<string> = React.memo(
  ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
    const defaultTransform = useChartTransform();

    let categorical: ColumnCursor<string>;
    let metric: ColumnCursor<string>;
    let categoricalScale: ScaleBand<string>;
    let metricScale: ScaleLinear<number, number>;
    if (isScaleBand(xScale) && isScaleContinuous(yScale)) {
      categorical = x;
      metric = y;
      categoricalScale = xScale;
      metricScale = yScale;
    } else if (isScaleBand(yScale) && isScaleContinuous(xScale)) {
      categorical = y;
      metric = x;
      categoricalScale = yScale;
      metricScale = xScale;
    } else {
      throw new Error("Unsupported case of scales");
    }

    // The categorical scale must be a band scale for composability with bar charts.
    // Half of the tick width must be added to align with the ticks.
    const categoricalTickWidth = categoricalScale.bandwidth();

    const missingDatum = (tick: string) => {
      const d = [];
      d[categorical.index] = tick;
      d[metric.index] = undefined;
      return d;
    };

    const rawData = data.mapRows(row => row);

    // Add missing data
    const ticks = categoricalScale.domain();
    const dataWithMissing = ticks.map(tick => {
      const datum = rawData.find(d => categorical(d) === tick);
      return datum || missingDatum(tick);
    });

    const pathData = dataWithMissing.map(row => {
      const categoricalValue = categoricalTickWidth / 2 + (categoricalScale(categorical(row)) as number);
      const metricValue = metricScale(metric(row));
      return { m: metricValue, c: categoricalValue };
    });

    const isDefined = (value: number | undefined) => value !== undefined;

    const path =
      line<{ m: number; c: number }>()
        .x(d => (isScaleBand(xScale) ? d.c : d.m))
        .y(d => (isScaleBand(xScale) ? d.m : d.c))
        .defined(d => isDefined(d.m))(pathData) || "";

    const pathStyle = (isFunction(style) ? style(data.row(0), 0) : style) || {};

    return (
      <>
        <g transform={transform || defaultTransform}>
          <path
            d={path}
            style={{
              fill: "none",
              strokeLinecap: "round",
              ...pathStyle,
            }}
          />
        </g>
        {showLabels && <Labels data={data} transform={transform} x={x} y={y} yScale={yScale} xScale={xScale} />}
      </>
    );
  },
);
