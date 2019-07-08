import React from "react";
import { FragmentFrame } from "../DataFrame/FragmentFrame";
import { PivotFrame } from "../DataFrame/PivotFrame";
import { DimensionLabels, HeightParam, WidthParam } from "./types";
/**
 * We support text only pivot grid out of the box,
 * for this case you don't need to provide cell render prop, but you need to provide measures
 */
interface TextOnlyPivotGridProps<Name extends string> {
    type?: "text";
    measures: Name[];
    /** default value is "column" */
    measuresPlacement?: "row" | "column";
}
/**
 * This is props for general PivotGrid, you need to provide cell render prop.
 * It can return any React component which will be rendered in cells
 */
declare type GeneralPivotGridProps<Name extends string> = {
    type: "general";
    cell: (prop: {
        data: FragmentFrame<Name>;
        width: number;
        height: number;
        row: number;
        column: number;
    }) => React.ReactNode;
} | {
    type: "generalWithMeasures";
    measures: Name[];
    /** default value is "column" */
    measuresPlacement?: "row" | "column";
    cell: (prop: {
        data: FragmentFrame<Name>;
        width: number;
        height: number;
        row: number;
        column: number;
        measure: Name;
    }) => React.ReactNode;
};
interface Accessors<Name extends string> {
    width?: (p: WidthParam<Name>) => number;
    height?: (p: HeightParam<Name>) => number;
}
interface Axes {
    row?: (rowProps: {
        row: number;
        width: number;
        height: number;
    }) => React.ReactNode;
    column?: (columnProps: {
        column: number;
        width: number;
        height: number;
    }) => React.ReactNode;
}
interface PivotGridStyle {
    cell?: React.CSSProperties;
    header?: React.CSSProperties;
    dimension?: React.CSSProperties;
    border?: string;
    background?: string;
}
declare type Props<Name extends string = string> = (TextOnlyPivotGridProps<Name> | GeneralPivotGridProps<Name>) & {
    width: number;
    height: number;
    data: PivotFrame<Name>;
    style?: PivotGridStyle;
    axes?: Axes;
    accessors?: Accessors<Name>;
    header?: (prop: {
        value: string;
        width: number;
        height: number;
    }) => React.ReactNode;
    dimensionLabels?: DimensionLabels | "top" | "left" | "none";
};
export declare const PivotGrid: <Name extends string = string>(props: Props<Name>) => JSX.Element;
export {};
//# sourceMappingURL=PivotGrid.d.ts.map