import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import React, { useMemo } from "react";
import { getCategoricalStats, getQuantitiveStats } from "../DataFrame/stats";
import { IteratableFrame } from "../DataFrame/types";

export interface BarsPropsHorizontal {
  direction?: "horizontal";
  xScale: ScaleLinear<any, any>;
  yScale: ScaleBand<string>;
  x: (row: any[]) => number;
  y: (row: any[]) => string;
}

export interface BarsPropsVeritcal {
  direction: "vertical";
  yScale: ScaleLinear<any, any>;
  xScale: ScaleBand<string>;
  y: (row: any[]) => number;
  x: (row: any[]) => string;
}

export type BarsProps<Name extends string> = (BarsPropsHorizontal | BarsPropsVeritcal) & {
  data: IteratableFrame<Name>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
};

/**
 * TODO: move scales to stats and use WeakMap instead of useMemo
 */

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
    () =>
      scaleLinear()
        .domain([0, getQuantitiveStats(data).max[column]])
        .range([0, size]),
    [data, size, column],
  );

type BarsComponent = <Name extends string>(props: BarsProps<Name>) => React.ReactElement | null;

export const Bars: BarsComponent = React.memo(props => {
  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  if (props.direction === "vertical") {
    const { data, transform, xScale, yScale, x, y } = props;
    const height = yScale(yScale.domain()[1]);
    return (
      <g transform={transform}>
        {data.map((d, i) => (
          <rect
            x={xScale(x(d))}
            y={height - yScale(y(d))}
            width={xScale.bandwidth()}
            height={yScale(y(d))}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const { data, transform, xScale, yScale, x, y } = props;
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
  }
});
