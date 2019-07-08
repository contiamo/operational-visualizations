import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useAxisTransform } from "./Chart";

export interface AxisProps {
  /** see  https://github.com/d3/d3-scale */
  scale: ScaleBand<any> | ScaleLinear<any, any>; // AxisScale<Domain>;
  // left | right | bottom | top
  position: "left" | "right" | "bottom" | "top";
  /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
  transform?: string;
}

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform, position }) => {
  const defaultTransform = useAxisTransform(position!);
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (ref.current) {
      switch (position) {
        case "bottom":
          select(ref.current).call(axisBottom(scale));
          break;
        case "top":
          select(ref.current).call(axisTop(scale));
          break;
        case "left":
          select(ref.current).call(axisLeft(scale));
          break;
        case "right":
          select(ref.current).call(axisRight(scale));
          break;
      }
    }
  }, [ref, scale, position]);
  return <g transform={transform || defaultTransform} ref={ref} />;
});
