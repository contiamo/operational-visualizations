import { line } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction } from "./utils";

export const Line: LinearAxialChart<string> = React.memo(props => {
  const defaultTransform = useChartTransform();

  const { metricDirection, data, transform, metric, categorical, metricScale, categoricalScale, style } = props;

  // The categorical scale must be a band scale for composability with bar charts.
  // Half of the tick width must be added to align with the ticks.
  const categoricalTickWidth = categoricalScale.bandwidth();
  const pathData = data.mapRows(row => {
    const categoricalValue = categoricalTickWidth / 2 + (categoricalScale(categorical(row)) as number);
    const metricValue = metricScale(metric(row));
    return { m: metricValue, c: categoricalValue };
  });

  const isDefined = (value: number | undefined) => value !==undefined;

  const path =
    line<{m: number, c: number}>()
      .x(d => metricDirection === "vertical" ? d.c : d.m)
      .y(d => metricDirection === "vertical" ? d.m : d.c)
      .defined(d => isDefined(d.m))(pathData) || "";

  const pathStyle = (isFunction(style) ? style(data.row(0), 0) : style) || {}

  return (
    <g transform={transform || defaultTransform}>
      <path
        d={path}
        style={{
          fill: "none",
          strokeLinecap: "round",
          ...pathStyle
        }}
      />
    </g>
  );
});
