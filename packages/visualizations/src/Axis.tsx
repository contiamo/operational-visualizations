import { axisBottom, axisLeft, axisTop, axisRight } from "d3-axis";
import { format as d3Format } from "d3-format";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { select, Selection as D3Selection, BaseType } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useAxisTransform } from "./Chart";
import { isScaleContinuous, isScaleBand } from "./scale";
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

const getTickInterval = (scale: AxisProps["scale"], maxNumberOfTicks?: number) => {
  const ticks = isScaleContinuous(scale) ? scale.ticks() : scale.domain();
  return Math.ceil(ticks.length / (maxNumberOfTicks || ticks.length));
};

const getTickFormatter = (scale: AxisProps["scale"], tickInterval: number) => {
  const formatter = isScaleContinuous(scale) ? d3Format("~s") : (d: any) => d;
  return (d: any, i: number) => (i % tickInterval === 0 ? formatter(d) : null);
};

const getTickSpacing = (scale: AxisProps["scale"]) => {
  if (isScaleBand(scale)) {
    return scale.bandwidth();
  }
  const range = scale.range();
  const nTicks = (scale as ScaleLinear<number, number>).ticks().length;
  return (range[1] - range[0]) / nTicks;
};

const wrap = (ctx: BaseType, maxWidth: number) => {
  const textEl = select(ctx);
  let text = textEl.text();
  let width = (textEl.node() as Element).getBoundingClientRect().width;
  while (width > maxWidth && text.length > 0) {
    text = text.slice(0, -1);
    textEl.text(text + "...");
    width = (textEl.node() as Element).getBoundingClientRect().width;
  }
};

export const Axis: React.FC<AxisProps> = React.memo(({ scale, transform, position, maxNumberOfTicks }) => {
  const defaultTransform = useAxisTransform(position!);
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (ref.current) {
      const tickInterval = getTickInterval(scale, maxNumberOfTicks);
      const tickFormat = getTickFormatter(scale, tickInterval);
      const tickSpacing = getTickSpacing(scale) * tickInterval;

      let axis: D3Selection<SVGGElement, unknown, null, undefined>;
      switch (position) {
        case "bottom":
          axis = select(ref.current).call(axisBottom(scale).tickFormat(tickFormat));
          applyStyles(axis);
          axis.selectAll("text").each(function() {
            wrap(this, tickSpacing);
          });
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
