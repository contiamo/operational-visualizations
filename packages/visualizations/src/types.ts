import { ColumnCursor, IteratableFrame } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

export interface AxialChartProps<Name extends string> {
  metricDirection: "horizontal" | "vertical";
  data: IteratableFrame<Name>;
  metric: ColumnCursor<Name>;
  categorical: ColumnCursor<Name>;
  metricScale: ScaleLinear<any, any>;
  categoricalScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export type AxialChart<Name extends string> = (props: AxialChartProps<Name>) => React.ReactElement | null;
