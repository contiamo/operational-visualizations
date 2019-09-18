import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";
import { format as d3Format } from "d3-format";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useAxisTransform } from "./Chart";
import { isScaleContinuous } from "./scale";

export interface AxisProps {
  /** see  https://github.com/d3/d3-scale */
  scale: ScaleBand<any> | ScaleLinear<number, number>; // AxisScale<Domain>;
  // left | right | bottom | top
  position: "left" | "right" | "bottom" | "top";
  /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
  transform?: string;
  maxNumberOfTicks?: number;
}

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform, position, maxNumberOfTicks = 10 }) => {
  const defaultTransform = useAxisTransform(position!);
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (ref.current) {
      const nTicks = (isScaleContinuous(scale) ? scale.ticks() : scale.domain()).length;
      const formatter = isScaleContinuous(scale) ? d3Format("~s") : (d: any) => d;
      const tickFormat =
        nTicks > maxNumberOfTicks
          ? (d: any, i: number) => (i % maxNumberOfTicks === 0 ? formatter(d) : null)
          : formatter;

      switch (position) {
        case "bottom":
          select(ref.current).call(axisBottom(scale).tickFormat(tickFormat));
          break;
        case "top":
          select(ref.current).call(axisTop(scale).tickFormat(tickFormat));
          break;
        case "left":
          select(ref.current).call(axisLeft(scale).tickFormat(tickFormat));
          break;
        case "right":
          select(ref.current).call(axisRight(scale).tickFormat(tickFormat));
          break;
      }
    }
  }, [ref, scale, position, maxNumberOfTicks]);
  return <g transform={transform || defaultTransform} ref={ref} />;
});
