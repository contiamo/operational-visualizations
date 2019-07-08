import * as React from "react";
import { AxisComputed, AxisPosition } from "../Chart/typings";
export interface AxisProps {
    data: AxisComputed;
    position: AxisPosition;
    width: number;
    margins: string;
}
declare const Axis: React.SFC<AxisProps>;
export default Axis;
//# sourceMappingURL=Axis.d.ts.map