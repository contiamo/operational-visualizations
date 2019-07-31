import { area } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";

export const Area: LinearAxialChart<string> = React.memo(props => {
  const defaultTransform = useChartTransform();
  const { metricDirection, data, transform, metric, categorical, metricScale, categoricalScale, stackRow, style } = props;

  // The categorical scale must be a band scale for composability with bar charts.
  // Half of the tick width must be added to align with the ticks.
  const categoricalTickWidth = categoricalScale.bandwidth();

  const pathData = data.mapRows(row => {
    const rowBaseline = stackRow ? stackRow(row) : 0;
    return {
      c: categoricalTickWidth / 2 + (categoricalScale(categorical(row)) || 0),
      m0: metricScale(rowBaseline),
      m1: metricScale(metric(row) + rowBaseline)
    };
  });

  const path =
    metricDirection === "vertical"
      ? area<{ c: number; m0: number; m1: number }>()
          .x0(d => d.c)
          .x1(d => d.c)
          .y0(d => d.m0)
          .y1(d => d.m1)
      : area<{ c: number; m0: number; m1: number }>()
          .x0(d => d.m0)
          .x1(d => d.m1)
          .y0(d => d.c)
          .y1(d => d.c);

  return (
    <g transform={transform || defaultTransform}>
      <path d={path(pathData) || ""} style={style} />
    </g>
  );
});
