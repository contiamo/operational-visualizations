import React, { CSSProperties } from "react";
export interface ChartProps {
    width: number;
    height: number;
    margin?: number;
    style?: CSSProperties;
}
export declare const useAxisTransform: (direction: "bottom" | "left") => string;
export declare const useChartTransform: () => string;
/**
 * General container for Charts. Can contain Axis, Bars etc.
 * Axis are drawn in margin area, other elements are drawn in main area.
 * Pay attention that real width is width-prop + 2 * margin-prop, the same goes for height.
 *
```
height   width           margin
+         +    +             +
|         |    | <-----------+
|         v    |             |
|   +-----+----+----------+  |
|   |                     |  |
+-> |                     |  |
    |   XXXXXX      XX    |  v
    |  XX    X    XX      |
+---+  X     XX  XX       +---+
    |  X      XXXX        |
    |  X                  |
    |                     |
    +----------+----------+
               |
               |
               +
```
 */
export declare const Chart: React.FC<ChartProps>;
//# sourceMappingURL=Chart.d.ts.map