import { ColumnCursor, IterableFrame, RawRow } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

export interface BaseAxialChartProps<Name extends string> {
  metricDirection: "horizontal" | "vertical";
  data: IterableFrame<Name>;
  metric: ColumnCursor<Name>;
  categorical: ColumnCursor<Name>;
  metricScale: ScaleLinear<any, any>;
  categoricalScale: ScaleBand<string>;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
}

export type DiscreteAxialChartProps<Name extends string> = BaseAxialChartProps<Name> & {
  style?: React.SVGAttributes<SVGGElement>["style"] | ((row: RawRow, i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export type LinearAxialChartProps<Name extends string> = BaseAxialChartProps<Name> & {
  style?: React.SVGAttributes<SVGGElement>["style"];
}

export type AxialChartProps<Name extends string> = DiscreteAxialChartProps<Name> | LinearAxialChartProps<Name>

export type DiscreteAxialChart<Name extends string> = (props: DiscreteAxialChartProps<Name>) => React.ReactElement | null;

export type LinearAxialChart<Name extends string> = (props: LinearAxialChartProps<Name>) => React.ReactElement | null;

export type AxialChart<Name extends string> = DiscreteAxialChart<Name> | LinearAxialChart<Name>;
