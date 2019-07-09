import { ColumnCursor, IteratableFrame } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
import { useChartTransform } from "./Chart";

export interface BarsProps<Name extends string = string> {
  direction: "horizontal" | "vertical";
  data: IteratableFrame<Name>;
  metric: ColumnCursor<Name>;
  categorical: ColumnCursor<Name>;
  metricScale: ScaleLinear<any, any>;
  categoricalScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

type BarsComponent = <Name extends string>(props: BarsProps<Name>) => React.ReactElement | null;

export const Bars: BarsComponent = React.memo(props => {
  const defaultTransform = useChartTransform();

  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  if (props.direction === "vertical") {
    const { data, transform, metric, categorical, metricScale, categoricalScale } = props;
    const height = metricScale(metricScale.domain()[0]);
    let y = 0;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i, prevRow) => {
          if (prevRow && prevRow[categorical.index] === row[categorical.index]) {
            y += height - metricScale(prevRow[metric.index]);
          } else {
            y = 0;
          }
          return (
            <rect
              x={categoricalScale(row[categorical.index])}
              y={metricScale(row[metric.index]) - y}
              width={categoricalScale.bandwidth()}
              height={height - metricScale(row[metric.index])}
              style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
              key={i}
            />
          );
        })}
      </g>
    );
  } else {
    const { data, transform, metric, categorical, metricScale, categoricalScale } = props;
    let x = 0;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i, prevRow) => {
          if (prevRow && prevRow[categorical.index] === row[categorical.index]) {
            x += metricScale(prevRow[metric.index]);
          } else {
            x = 0;
          }
          return (
            <rect
              y={categoricalScale(row[categorical.index])}
              x={x}
              height={categoricalScale.bandwidth()}
              width={metricScale(row[metric.index])}
              style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
              key={i}
            />
          );
        })}
      </g>
    );
  }
});
