import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
import { ColumnCursor, IteratableFrame } from "../DataFrame/types";

export interface BarsPropsHorizontal {
  direction?: "horizontal";
  xScale: ScaleLinear<any, any>;
  yScale: ScaleBand<string>;
  x: ColumnCursor<string, string>;
  y: ColumnCursor<string, number>;
}

export interface BarsPropsVeritcal {
  direction: "vertical";
  yScale: ScaleLinear<any, any>;
  xScale: ScaleBand<string>;
  y: ColumnCursor<string, number>;
  x: ColumnCursor<string, string>;
}

export type BarsProps<Name extends string> = (BarsPropsHorizontal | BarsPropsVeritcal) & {
  data: IteratableFrame<Name>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
};

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
        {data.mapRows((d, i) => (
          <rect
            x={xScale(d[x.index])}
            y={height - yScale(d[y.index])}
            width={xScale.bandwidth()}
            height={yScale(d[y.index])}
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
        {data.mapRows((d, i) => (
          <rect
            y={yScale(d[y.index])}
            x={0}
            height={yScale.bandwidth()}
            width={xScale(d[x.index])}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  }
});
