import { max, range } from "d3-array";
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import React, { useMemo } from "react";

export interface BarsProps {
  data: any[]; // TODO change to DataFrame
  widthScale: ScaleBand<any>;
  heightScale: ScaleLinear<any, any>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export const useScaleBand = ({
  data,
  size,
}: {
  data: any[]; // TODO change to DataFrame
  size: number;
}) =>
  useMemo(
    () =>
      scaleBand()
        .domain(range(0, data.length) as any)
        .range([0, size]),
    [data, size],
  );

export const useScaleLinear = ({
  data,
  size,
}: {
  data: any[]; // TODO change to DataFrame
  size: number;
}) =>
  useMemo(
    () =>
      scaleLinear()
        .domain([0, max(data)])
        .range([0, size]),
    [data, size],
  );

export const Bars: React.FC<BarsProps> = React.memo(props => {
  const { data, transform, widthScale, heightScale } = props;
  const height = heightScale(heightScale.domain()[1]);
  // TypeScript can't handle this case normally :/
  const styleProp =
    typeof props.style === "function"
      ? { isFunction: true as true, style: props.style }
      : { isFunction: false as false, style: props.style };

  return (
    <g transform={transform}>
      {data.map((d, i) => (
        <rect
          x={widthScale(i)}
          y={height - heightScale(d)}
          width={widthScale.bandwidth()}
          height={heightScale(d)}
          style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
          key={i}
        />
      ))}
    </g>
  );
});
