import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import React, { useMemo } from "react";
import { DataFrame } from "..";
import { getCategoricalStats, getQuantitiveStats } from "../DataFrame/stats";
import { IteratableFrame } from "../DataFrame/types";

export interface BarsProps {
  data: DataFrame<string>;
  xScale: ScaleLinear<any, any>;
  yScale: ScaleBand<any>;
  y: (row: any[]) => number;
  x: (row: any[]) => number;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export const useScaleBand = <Name extends string>({
  data,
  column,
  size,
}: {
  data: IteratableFrame<Name>;
  column: Name;
  size: number;
}) =>
  useMemo(
    () =>
      scaleBand()
        .domain(getCategoricalStats(data).unqiue[column])
        .range([0, size]),
    [data, size],
  );

export const useScaleLinear = <Name extends string>({
  data,
  column,
  size,
}: {
  data: IteratableFrame<Name>;
  column: Name;
  size: number;
}) =>
  useMemo(
    () => {
      return scaleLinear()
        .domain([0, getQuantitiveStats(data).max[column]])
        .range([0, size]);
    },
    [data, size, column],
  );

export const Bars: React.FC<BarsProps> = React.memo(props => {
  const { data, transform, xScale, yScale, x, y } = props;
  // const width = xScale(xScale.domain()[1]);
  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  return (
    <g transform={transform}>
      {data.map((d, i) => (
        <rect
          y={yScale(y(d))}
          x={0}
          height={yScale.bandwidth()}
          width={xScale(x(d))}
          style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
          key={i}
        />
      ))}
    </g>
  );
});
