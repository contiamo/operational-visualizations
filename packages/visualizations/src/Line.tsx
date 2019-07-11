import { ColumnCursor, DataFrame } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { line } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";

export interface LineProps<Name extends string = string> {
  monotoneDirection: "horizontal" | "vertical";
  data: DataFrame<Name>;
  metric: ColumnCursor<Name>;
  categorical: ColumnCursor<Name>;
  metricScale: ScaleLinear<any, any>;
  categoricalScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"];
}

type LineComponent = <Name extends string>(
  props: LineProps<Name>
) => React.ReactElement | null;

export const Line: LineComponent = React.memo(props => {
  const defaultTransform = useChartTransform();
  const {
    monotoneDirection,
    data,
    transform,
    metric,
    categorical,
    metricScale,
    categoricalScale,
    style
  } = props;

  // The categorical scale must be a band scale for composability with bar charts.
  // Half of the tick width must be added to align with the ticks.
  const categoricalTickWidth = categoricalScale.bandwidth();
  const pathData = data.mapRows(row => {
    const categoricalValue =
      categoricalTickWidth / 2 + (categoricalScale(categorical(row)) as number);
    const metricValue = metricScale(metric(row));
    return (monotoneDirection === "horizontal"
      ? [categoricalValue, metricValue]
      : [metricValue, categoricalValue]) as [number, number];
  });

  const path =
    line()
      .x(d => d[0])
      .y(d => d[1])(pathData) || "";

  return (
    <g transform={transform || defaultTransform}>
      <path d={path} style={{ fill: "none", ...style }} />
    </g>
  );
});
