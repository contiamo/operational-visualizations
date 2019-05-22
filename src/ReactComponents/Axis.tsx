import { axisBottom, axisLeft } from "d3-axis";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useAxisTransform } from "./Chart";

export interface AxisProps {
  /** see  https://github.com/d3/d3-scale */
  scale: ScaleBand<any> | ScaleLinear<any, any>; // AxisScale<Domain>;
  // left | right | bottom | top
  direction: "left" | "bottom";
  /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
  transform?: string;
}

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform, direction }) => {
  const defaultTransform = useAxisTransform(direction!);

  const ref = useRef<SVGGElement>(null);
  useEffect(
    () => {
      if (ref.current) {
        if (direction === "bottom") {
          select(ref.current).call(axisBottom(scale));
        } else {
          select(ref.current).call(axisLeft(scale));
        }
      }
    },
    [ref, scale, direction],
  );
  return <g transform={transform || defaultTransform} ref={ref} />;
});
