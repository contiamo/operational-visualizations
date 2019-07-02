import { DataFrame } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
import { useChartTransform } from "./Chart";

export interface BarsProps<Name extends string> {
  direction: "horizontal" | "vertical"
  data: DataFrame<Name>;
  measure: Name;
  dimension: Name;
  measureScale: ScaleLinear<any, any>;
  dimensionScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
};

type BarsComponent = <Name extends string>(props: BarsProps<Name>) => React.ReactElement | null;

export const Bars: BarsComponent = React.memo(props => {
  const defaultTransform = useChartTransform();

  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  if (props.direction === "vertical") {
    const { data, transform, measure, dimension, measureScale, dimensionScale } = props;
    const height = measureScale(measureScale.domain()[0]);
    const xIndex = data.getCursor(dimension).index
    const yIndex = data.getCursor(measure).index
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            x={dimensionScale(row[xIndex])}
            y={measureScale(row[yIndex])}
            width={dimensionScale.bandwidth()}
            height={height - measureScale(row[yIndex])}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const { data, transform, measure, dimension, measureScale, dimensionScale } = props;
    const xIndex = data.getCursor(measure).index
    const yIndex = data.getCursor(dimension).index
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            y={dimensionScale(row[yIndex])}
            x={0}
            height={dimensionScale.bandwidth()}
            width={measureScale(row[xIndex])}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  }
});
