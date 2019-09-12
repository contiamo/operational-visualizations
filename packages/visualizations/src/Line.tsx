import { line } from "d3-shape";
import React, { useMemo } from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction } from "./utils";
import { Labels } from "./Labels";
import { isScaleBand } from "./scale";
import { IterableFrame, ColumnCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

const useHoles = (
  data: IterableFrame<string>,
  x: ColumnCursor<string>,
  y: ColumnCursor<string>,
  xScale: ScaleBand<string> | ScaleLinear<number, number>,
  yScale: ScaleBand<string> | ScaleLinear<number, number>,
) =>
  useMemo(() => {
    const xTicks = isScaleBand(xScale) ? xScale.domain() : [];
    const yTicks = isScaleBand(yScale) ? yScale.domain() : [];

    // TODO: check if arrays of the same length and don't try to "fill holes"
    let offset = 0;
    return xTicks.length > 0
      ? xTicks.map((z, i) => {
          let row = data.row(i + offset) || [];
          if (z !== x(row)) {
            offset -= 1;
            return [];
          }
          return row;
        })
      : yTicks.map((z, i) => {
          let row = data.row(i + offset) || [];
          if (z !== y(row)) {
            offset -= 1;
            return [];
          }
          return row;
        });
  }, [data, x, y, xScale, yScale]);

export const Line: LinearAxialChart<string> = React.memo(
  ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
    const defaultTransform = useChartTransform();

    // TODO add check that scales are correct
    const dataWithHoles = useHoles(data, x, y, xScale, yScale);

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
