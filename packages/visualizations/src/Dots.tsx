import React from "react";
import { useChartTransform } from "./Chart";
import { isFunction } from "./utils";
import { IterableFrame, ColumnCursor, RowCursor } from "@operational/frame";
import { ScaleLinear, ScaleBand } from "d3-scale";
import { isScaleBand } from "./scale";
import { Labels } from "./Labels";

const radius = 3;

export interface DotsProps<Name extends string> {
  data: IterableFrame<Name>;
  x: ColumnCursor<Name>;
  y: ColumnCursor<Name>;
  xScale: ScaleLinear<any, any> | ScaleBand<string>;
  yScale: ScaleLinear<any, any> | ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((
        row: RowCursor,
        i: number
      ) => React.SVGAttributes<SVGGElement>["style"]);
  showLabels?: boolean;
}

export const Dots = <Name extends string>(props: DotsProps<Name>) => {
  const defaultTransform = useChartTransform();
  const { data, transform, x, y, xScale, yScale, style, showLabels } = props;
  const xBandWidth = isScaleBand(xScale) ? xScale.bandwidth() : 0;
  const yBandWidth = isScaleBand(yScale) ? yScale.bandwidth() : 0;
  // Temporary solution until Labels and other renderers have been refactored to take x and y parameters
  // rather than categorical and metric.
  const isVertical = isScaleBand(xScale);
  return (
    <>
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <circle
            cx={xScale(x(row)) + xBandWidth / 2}
            cy={yScale(y(row)) + yBandWidth / 2}
            r={radius}
            style={isFunction(style) ? style(row, i) : style}
            key={i}
          />
        ))}
      </g>
      {showLabels && (
        <Labels
          data={data}
          transform={transform}
          metric={isVertical ? y : x}
          categorical={isVertical ? x : y}
          metricScale={(isVertical ? yScale : xScale) as ScaleLinear<any, any>}
          categoricalScale={(isVertical ? xScale : yScale) as ScaleBand<string>}
          metricDirection={isVertical ? "vertical" : "horizontal"}
          style={{ transform: `translate(0, -${radius}px)` }}
        />
      )}
    </>
  );
};
