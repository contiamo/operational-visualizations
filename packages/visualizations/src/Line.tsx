import { line } from "d3-shape";
import React, { useMemo } from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction, fillHoles } from "./utils";
import { Labels } from "./Labels";
import { isScaleBand, isScaleContinious } from "./scale";
import { IterableFrame, ColumnCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

const useFillHoles = (
  data: IterableFrame<string>,
  x: ColumnCursor<string>,
  y: ColumnCursor<string>,
  xScale: ScaleBand<string> | ScaleLinear<number, number>,
  yScale: ScaleBand<string> | ScaleLinear<number, number>,
) => useMemo(() => fillHoles(data, x, y, xScale, yScale), [data, x, y, xScale, yScale]);

export const Line: LinearAxialChart<string> = React.memo(
  ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
    const defaultTransform = useChartTransform();

    if (isScaleBand(xScale) && isScaleContinious(yScale)) {
      // do nothing
    } else if (isScaleBand(yScale) && isScaleContinious(xScale)) {
      // do nothing
    } else {
      throw new Error("Unsupported case of scales");
    }

    const dataWithHoles = useFillHoles(data, x, y, xScale, yScale);

    const path = useMemo(() => {
      const pathData = dataWithHoles.map(row => {
        const xCoordinate = isScaleBand(xScale) ? xScale.bandwidth() / 2 + (xScale(x(row)) || 0) : xScale(x(row));
        const yCoordinate = isScaleBand(yScale) ? yScale.bandwidth() / 2 + (yScale(y(row)) || 0) : yScale(y(row));
        return { xCoordinate, yCoordinate };
      });

      return (
        line<{ xCoordinate: number; yCoordinate: number }>()
          .x(d => d.xCoordinate)
          .y(d => d.yCoordinate)
          .defined(d => d.xCoordinate !== undefined && d.yCoordinate !== undefined)(pathData) || ""
      );
    }, [dataWithHoles, x, y, xScale, yScale]);

    const pathStyle = (isFunction(style) ? style(data.row(0), 0) : style) || {};

    return (
      <>
        <g transform={transform || defaultTransform}>
          <path
            d={path}
            style={{
              fill: "none",
              strokeLinecap: "round",
              ...pathStyle,
            }}
          />
        </g>
        {showLabels && <Labels data={data} transform={transform} x={x} y={y} yScale={yScale} xScale={xScale} />}
      </>
    );
  },
);
