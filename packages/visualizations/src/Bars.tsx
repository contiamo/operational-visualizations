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

export const Bars: BarsComponent = props => {
  const defaultTransform = useChartTransform();

  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  if (props.direction === "vertical") {
    const { data, transform, metric, categorical, metricScale, categoricalScale } = props;
    const height = metricScale(metricScale.domain()[0]);

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            x={categoricalScale(categorical(row))}
            y={metricScale(metric(row))}
            width={categoricalScale.bandwidth()}
            height={height - metricScale(metric(row))}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const { data, transform, metric, categorical, metricScale, categoricalScale } = props;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            y={categoricalScale(categorical(row))}
            x={0}
            height={categoricalScale.bandwidth()}
            width={metricScale(metric(row))}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  }
};
