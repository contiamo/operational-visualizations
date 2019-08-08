import React from "react";
import { DataFrame, RowCursor, ColumnCursor } from "@operational/frame";
import { arc, pie } from "d3-shape";
import { isFunction } from "./utils";
import { useChartTransform } from "./Chart";

interface PieChartProps<Name extends string> {
  width: number;
  height: number;
  data: DataFrame<Name>;
  metric: ColumnCursor<Name>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((row: RowCursor, i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export const PieChart = (props: PieChartProps<string>) => {
  const defaultTransform = useChartTransform();

  const { data, width, height, metric, transform, style } = props;
  const pieData = pie<RowCursor>().value(metric)(data.mapRows(row => row))

  return (
    <g transform={transform || defaultTransform}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {pieData.map((datum, i) => (
          <path
            key={i}
            d={arc().innerRadius(0).outerRadius(Math.min(width, height) / 2)(datum as any) as string}
            style={isFunction(style) ? style(datum.data, i) : style}
          />
        ))}
      </g>
    </g>
  );
};
