import { DataFrame, FragmentFrame } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
import { useChartTransform } from "./Chart";

export interface BarsProps<Name extends string> {
  direction: "horizontal" | "vertical";
  data: DataFrame<Name> | FragmentFrame<Name>;
  metric: Name;
  categorical: Name;
  metricScale: ScaleLinear<any, any>;
  categoricalScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

type BarsComponent = <Name extends string>(
  props: BarsProps<Name>
) => React.ReactElement | null;

export const Bars: BarsComponent = React.memo(props => {
  const defaultTransform = useChartTransform();

  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  if (props.direction === "vertical") {
    const {
      data,
      transform,
      metric,
      categorical,
      metricScale,
      categoricalScale
    } = props;
    const height = metricScale(metricScale.domain()[0]);
    const xIndex = data.getCursor(categorical).index;
    const yIndex = data.getCursor(metric).index;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            x={categoricalScale(row[xIndex])}
            y={metricScale(row[yIndex])}
            width={categoricalScale.bandwidth()}
            height={height - metricScale(row[yIndex])}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const {
      data,
      transform,
      metric,
      categorical,
      metricScale,
      categoricalScale
    } = props;
    const xIndex = data.getCursor(metric).index;
    const yIndex = data.getCursor(categorical).index;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            y={categoricalScale(row[yIndex])}
            x={0}
            height={categoricalScale.bandwidth()}
            width={metricScale(row[xIndex])}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  }
});
