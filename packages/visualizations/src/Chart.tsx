import React, { CSSProperties, useContext } from "react";

type Margin = number | [number, number] | [number, number, number, number];
export interface ChartProps {
  width: number;
  height: number;
  /**
   * If a single value is provided, the same margin is applied to all sides.
   * If 2 values are specified, these represent top/bottom margins, and left/right margins.
   * If 4 values are specified, these are the top, right, bottom and left margins, in that order.
   */
  margin?: Margin;
  style?: CSSProperties;
}

const initialMargins = { top: 0, bottom: 0, left: 0, right: 0 };
const ChartContext = React.createContext({
  margins: initialMargins,
  width: 0,
  height: 0,
});

export const useAxisTransform = (direction: "left" | "right" | "top" | "bottom") => {
  const { margins, height, width } = useContext(ChartContext);
  switch (direction) {
    case "bottom":
      return `translate(${margins.left}, ${height + margins.top})`;
    case "top":
      return `translate(${margins.left}, ${margins.top})`;
    case "left":
      return `translate(${margins.left}, ${margins.top})`;
    case "right":
      return `translate(${width + margins.left}, ${margins.top})`;
  }
};

export const useChartTransform = () => {
  const { margins } = useContext(ChartContext);
  return `translate(${margins.left}, ${margins.top})`;
};

const expandMargins = (margin: Margin) =>
  Array.isArray(margin)
    ? {
        top: margin[0],
        right: margin[1],
        bottom: margin[2] || margin[0],
        left: margin[3] || margin[1],
      }
    : {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin,
      };

// tslint:disable
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
export const Chart: React.FC<ChartProps> = React.memo(({ width, height, margin = 0, style, children }) => {
  const margins = expandMargins(margin);
  return (
    // tslint:enable
    <svg
      width={width + margins.left + margins.right}
      height={height + margins.top + margins.bottom}
      viewBox={`0 0 ${width + margins.left + margins.right} ${height + margins.top + margins.bottom}`}
      style={style}
    >
      <ChartContext.Provider value={{ margins, width, height }}>{children}</ChartContext.Provider>
    </svg>
  );
});
