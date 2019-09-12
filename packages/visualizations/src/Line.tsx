import { line } from "d3-shape";
import React from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction } from "./utils";
import { Labels } from "./Labels";
import { isScaleBand } from "./scale";

export const Line: LinearAxialChart<string> = React.memo(
  ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
    const defaultTransform = useChartTransform();

    // TODO add check that scales are correct
    const xTicks = isScaleBand(xScale) ? xScale.domain() : [];
    const yTicks = isScaleBand(yScale) ? yScale.domain() : [];

    let offset = 0;
    const dataWithHoles =
      xTicks.length > 0
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

    const pathData = dataWithHoles.map(row => {
      const xCoordinate = isScaleBand(xScale) ? xScale.bandwidth() / 2 + (xScale(x(row)) as number) : xScale(x(row));
      const yCoordinate = isScaleBand(yScale) ? yScale.bandwidth() / 2 + (yScale(y(row)) as number) : yScale(y(row));
      return { xCoordinate, yCoordinate };
    });

    const path =
      line<{ xCoordinate: number; yCoordinate: number }>()
        .x(d => d.xCoordinate)
        .y(d => d.yCoordinate)
        .defined(d => d.xCoordinate !== undefined && d.yCoordinate !== undefined)(pathData) || "";

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
