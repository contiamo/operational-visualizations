import React from "react";
import DataFrame from "../DataFrame/DataFrame";
interface Props<Name extends string = string> {
    width: number;
    height: number;
    data: DataFrame<Name>;
    style?: {
        cell?: React.CSSProperties;
        header?: React.CSSProperties;
        dimension?: React.CSSProperties;
        border?: string;
        background?: string;
    };
    accessors?: {
        width?: () => number;
        height?: () => number;
    };
    header?: (prop: {
        value: Name;
    }) => React.ReactNode;
}
export declare function TableGrid<Name extends string = string>(props: Props<Name>): JSX.Element;
export {};
//# sourceMappingURL=TableGrid.d.ts.map