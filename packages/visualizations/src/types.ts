import { ColumnCursor, IterableFrame, RowCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";

export interface BaseAxialChartProps<Name extends string> {
  metricDirection: "horizontal" | "vertical";
  data: IterableFrame<Name>;
  metric: ColumnCursor<Name>;
  categorical: ColumnCursor<Name>;
  metricScale: ScaleLinear<number, number>;
  categoricalScale: ScaleBand<string>;
  showLabels?: boolean;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?:
    | React.SVGAttributes<SVGGElement>["style"]
    | ((row: RowCursor, i: number) => React.SVGAttributes<SVGGElement>["style"]);
}

export type LinearAxialChartProps<Name extends string> = BaseAxialChartProps<Name> & {
  stack?: Array<ColumnCursor<Name>>;
};

export type AxialChartProps<Name extends string> = BaseAxialChartProps<Name> | LinearAxialChartProps<Name>;

export type DiscreteAxialChart<Name extends string> = (props: BaseAxialChartProps<Name>) => React.ReactElement | null;

export type LinearAxialChart<Name extends string> = (props: LinearAxialChartProps<Name>) => React.ReactElement | null;

export type AxialChart<Name extends string> = DiscreteAxialChart<Name> | LinearAxialChart<Name>;
