import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
import { ColumnCursor, IteratableFrame } from "../DataFrame/types";
export interface BarsPropsHorizontal {
    direction?: "horizontal";
    xScale: ScaleLinear<any, any>;
    yScale: ScaleBand<string>;
    x: ColumnCursor<string, string>;
    y: ColumnCursor<string, number>;
}
export interface BarsPropsVeritcal {
    direction: "vertical";
    yScale: ScaleLinear<any, any>;
    xScale: ScaleBand<string>;
    y: ColumnCursor<string, number>;
    x: ColumnCursor<string, string>;
}
export declare type BarsProps<Name extends string> = (BarsPropsHorizontal | BarsPropsVeritcal) & {
    data: IteratableFrame<Name>;
    transform?: React.SVGAttributes<SVGRectElement>["transform"];
    style?: React.SVGAttributes<SVGGElement>["style"] | ((i: number) => React.SVGAttributes<SVGGElement>["style"]);
};
declare type BarsComponent = <Name extends string>(props: BarsProps<Name>) => React.ReactElement | null;
export declare const Bars: BarsComponent;
export {};
//# sourceMappingURL=Bars.d.ts.map