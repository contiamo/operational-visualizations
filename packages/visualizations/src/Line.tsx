import { line } from "d3-shape";
import React, { useMemo } from "react";
import { useChartTransform } from "./Chart";
import { LinearAxialChart } from "./types";
import { isFunction, fillHoles } from "./utils";
import { Labels } from "./Labels";
import { isScaleBand, isScaleContinuous } from "./scale";

export const Line: LinearAxialChart<string> = React.memo(
  ({ data, transform, x, y, xScale, yScale, showLabels, style }) => {
    if (isScaleBand(xScale) && isScaleContinuous(yScale)) {
      // do nothing
    } else if (isScaleBand(yScale) && isScaleContinuous(xScale)) {
      // do nothing
    } else {
      throw new Error("Unsupported case of scales");
    }

    const defaultTransform = useChartTransform();

    const path = useMemo(() => {
      const xShift = isScaleBand(xScale) ? xScale.bandwidth() / 2 : 0;
      const yShift = isScaleBand(yScale) ? yScale.bandwidth() / 2 : 0;
      const pathData = fillHoles(data, x, y, xScale, yScale).map(row => ({ x: xScale(x(row)), y: yScale(y(row)) }));
      return (
        line<{ x?: number; y?: number }>()
          .x(d => d.x! + xShift)
          .y(d => d.y! + yShift)
          .defined(d => d.x !== undefined && d.y !== undefined)(pathData) || ""
      );
    }, [data, x, y, xScale, yScale]);

    const pathStyle = useMemo(
      () =>
        ({
          fill: "none",
          strokeLinecap: "round",
          ...(isFunction(style) ? style(data.row(0), 0) : style),
        } as React.SVGAttributes<SVGPathElement>["style"]),
      [style, data],
    );

    return (
      <>
        <g transform={transform || defaultTransform}>
          <path d={path} style={pathStyle} />
        </g>
        {showLabels && <Labels data={data} transform={transform} x={x} y={y} yScale={yScale} xScale={xScale} />}
      </>
    );
  },
);
