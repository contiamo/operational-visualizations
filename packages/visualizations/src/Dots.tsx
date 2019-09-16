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
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((row: RowCursor, i: number) => React.SVGAttributes<SVGGElement>["style"]);
  showLabels?: boolean;
}

export const Dots = <Name extends string>({
  data,
  transform,
  x,
  y,
  xScale,
  yScale,
  style,
  showLabels,
}: DotsProps<Name>) => {
  const defaultTransform = useChartTransform();
  const xBandWidth = isScaleBand(xScale) ? xScale.bandwidth() : 0;
  const yBandWidth = isScaleBand(yScale) ? yScale.bandwidth() : 0;

  if (isScaleBand(xScale) && isScaleBand(yScale)) {
    showLabels = false;
  }
  if (!isScaleBand(xScale) && !isScaleBand(yScale)) {
    showLabels = false;
  }

  return (
    <>
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => {
          const cx = xScale(x(row));
          const cy = yScale(y(row));
          if (cx === undefined || cy === undefined) {
            return null;
          }
          return (
            <circle
              cx={cx + xBandWidth / 2}
              cy={cy + yBandWidth / 2}
              r={radius}
              style={isFunction(style) ? style(row, i) : style}
              key={i}
            />
          );
        })}
      </g>
      {showLabels && (
        <Labels
          data={data}
          transform={transform}
          x={x}
          y={y}
          yScale={yScale}
          xScale={xScale}
          style={{ transform: `translate(-${radius}px, -${radius}px)` }}
        />
      )}
    </>
  );
};
