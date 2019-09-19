import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";
import { format as d3Format } from "d3-format";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { select, Selection as D3Selection } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useAxisTransform } from "./Chart";
import { isScaleContinuous } from "./scale";
import theme from "./theme";

export interface AxisProps {
  /** see  https://github.com/d3/d3-scale */
  scale: ScaleBand<any> | ScaleLinear<number, number>; // AxisScale<Domain>;
  // left | right | bottom | top
  position: "left" | "right" | "bottom" | "top";
  /** see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform */
  transform?: string;
  maxNumberOfTicks?: number;
}

const applyStyles = (axis: D3Selection<SVGGElement, unknown, null, undefined>) => {
  axis.selectAll("text").style("color", theme.colors.axis.label);
  axis.selectAll("path").style("color", theme.colors.axis.border);
  axis.selectAll("line").style("color", theme.colors.axis.border);
};

const getTickFormatter = (scale: AxisProps["scale"], maxNumberOfTicks?: number) => {
  const formatter = isScaleContinuous(scale) ? d3Format("~s") : (d: any) => d;
  if (maxNumberOfTicks === undefined) {
    return formatter;
  }
  const ticks = isScaleContinuous(scale) ? scale.ticks() : scale.domain();
  const tickInterval = Math.ceil(ticks.length / maxNumberOfTicks);
  return (d: any, i: number) => (i % tickInterval === 0 ? formatter(d) : null);
};

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform, position, maxNumberOfTicks }) => {
  const defaultTransform = useAxisTransform(position!);
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (ref.current) {
      const tickFormat = getTickFormatter(scale, maxNumberOfTicks);

      let axis: D3Selection<SVGGElement, unknown, null, undefined>;
      switch (position) {
        case "bottom":
          axis = select(ref.current).call(axisBottom(scale).tickFormat(tickFormat));
          applyStyles(axis);
          break;
        case "top":
          axis = select(ref.current).call(axisTop(scale).tickFormat(tickFormat));
          applyStyles(axis);
          break;
        case "left":
          axis = select(ref.current).call(axisLeft(scale).tickFormat(tickFormat));
          applyStyles(axis);
          break;
        case "right":
          axis = select(ref.current).call(axisRight(scale).tickFormat(tickFormat));
          applyStyles(axis);
          break;
      }
    }
  }, [ref, scale, position, maxNumberOfTicks]);
  return <g transform={transform || defaultTransform} ref={ref} />;
});
