import { ScaleBand, ScaleLinear } from "d3-scale";
import React from "react";
export interface AxisProps {
    /** see  https://github.com/d3/d3-scale */
    scale: ScaleBand<any> | ScaleLinear<any, any>;
    direction: "left" | "bottom";
    /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
    transform?: string;
}
export declare const Axis: React.FC<AxisProps>;
//# sourceMappingURL=Axis.d.ts.map