import React from "react";
import { RowCursor, ColumnCursor, IterableFrame } from "@operational/frame";
import { arc, pie, PieArcDatum } from "d3-shape";
import { isFunction, numberFormatter } from "./utils";
import { useChartTransform } from "./Chart";
import { verticalStyle as verticalLabelStyle } from "./Labels";

interface PieChartProps<Name extends string> {
  width: number;
  height: number;
  data: IterableFrame<Name>;
  metric: ColumnCursor<Name>;
  showLabels?: boolean;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((row: RowCursor, i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export const PieChart = (props: PieChartProps<string>) => {
  const defaultTransform = useChartTransform();

  const { data, width, height, metric, showLabels, transform, style } = props;
  const pieData = pie<RowCursor>().value(metric)(data.mapRows(row => row));
  const radius = Math.min(width, height) / 2;
  const segmentArc = arc<PieArcDatum<RowCursor>>()
    .innerRadius(0)
    .outerRadius(radius);
  const segmentArcForLabel = arc<PieArcDatum<RowCursor>>()
    .innerRadius(0.7 * radius)
    .outerRadius(radius);

  return (
    <g transform={transform || defaultTransform}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {pieData.map((datum, i) => {
          const labelPosition = segmentArcForLabel.centroid(datum);
          return (
            <>
              <path
                key={`segment-${i}`}
                d={segmentArc(datum) || ""}
                style={isFunction(style) ? style(datum.data, i) : style}
              />
              {showLabels && (
                <text
                  x={labelPosition[0]}
                  y={labelPosition[1]}
                  style={{
                    ...verticalLabelStyle,
                    fill: "white",
                  }}
                  key={`label-${i}`}
                >
                  {numberFormatter(datum.value)}
                </text>
              )}
            </>
          );
        })}
      </g>
    </g>
  );
};
