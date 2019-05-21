import { axisLeft } from "d3-axis";
import { ScaleBand } from "d3-scale";
import { select } from "d3-selection";
import React, { useEffect, useRef } from "react";

export interface AxisProps {
  /** see  https://github.com/d3/d3-scale */
  scale: ScaleBand<any>; // AxisScale<Domain>;
  // left | right | bottom | top
  orientation?: "left";
  /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
  transform?: string;
}

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform }) => {
  const ref = useRef<SVGGElement>(null);
  useEffect(
    () => {
      if (ref.current) {
        select(ref.current).call(axisLeft(scale));
      }
    },
    [ref, scale],
  );
  return <g transform={transform} ref={ref} />;
});
