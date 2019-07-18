import { area } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";

export const Area: LinearAxialChart<string> = React.memo(props => {
  const defaultTransform = useChartTransform();

  const { metricDirection, data, transform, metric, categorical, metricScale, categoricalScale, style } = props;

  // The categorical scale must be a band scale for composability with bar charts.
  // Half of the tick width must be added to align with the ticks.
  const categoricalTickWidth = categoricalScale.bandwidth();
  const pathData = data.mapRows(row => {
    const categoricalValue = categoricalTickWidth / 2 + (categoricalScale(categorical(row)) as number);
    const metricValue = metricScale(metric(row));
    return (metricDirection === "vertical" ? [categoricalValue, metricValue] : [metricValue, categoricalValue]) as [
      number,
      number
    ];
  });

  const path =
    area()
      .x0(d => (metricDirection === "vertical" ? d[0] : metricScale.range()[0]))
      .x1(d => d[0])
      .y0(d => (metricDirection === "vertical" ? metricScale.range()[0] : d[1]))
      .y1(d => d[1])(pathData) || "";

  return (
    <g transform={transform || defaultTransform}>
      <path d={path} style={style} />
    </g>
  );
});
