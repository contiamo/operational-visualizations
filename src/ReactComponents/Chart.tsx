import React, { CSSProperties, useContext } from "react";

export interface ChartProps {
  width: number;
  height: number;
  margin?: number;
  style?: CSSProperties;
}

const ChartContext = React.createContext({ margin: 0, width: 0, height: 0 });

export const useAxisTransform = (direction: "left" | "bottom") => {
  const { margin, height } = useContext(ChartContext);
  return direction === "bottom" ? `translate(${margin}, ${height + margin})` : `translate(${margin}, ${margin})`;
};

export const useChartTransform = () => {
  const { margin } = useContext(ChartContext);
  return `translate(${margin}, ${margin})`;
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
export const Chart: React.FC<ChartProps> = React.memo(({ width, height, margin: margin, style, children }) => (
  // tslint:enable
  <svg
    width={width + margin! * 2}
    height={height + margin! * 2}
    viewBox={`0 0 ${width + margin! * 2} ${height + margin! * 2}`}
    style={style}
  >
    <ChartContext.Provider value={{ margin: margin!, width, height }}>{children}</ChartContext.Provider>
  </svg>
));

Chart.defaultProps = {
  margin: 0,
};
