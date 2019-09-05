import React from "react";
import { useChartTransform } from "./Chart";
import { ScaleBand, ScaleLinear } from "d3-scale";
import theme from "./theme";

interface AxisRulesProps {
  scale: ScaleLinear<any, any> | ScaleBand<string>;
  // left | right | bottom | top
  position: "left" | "right" | "bottom" | "top";
  length: number;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"];
}

const rulesAreHorizontal = (position: AxisRulesProps["position"]) =>
  ["left", "right"].includes(position);

export const AxisRules = React.memo((props: AxisRulesProps) => {
  const defaultTransform = useChartTransform();

  const { scale, position, length, transform, style } = props;

  const ticks: any[] = "ticks" in scale ? scale.ticks() : scale.domain();

  const offset =
    "ticks" in scale ? 0 : -(scale.paddingOuter() * scale.bandwidth()) / 2;

  return (
    <g transform={transform || defaultTransform}>
      {rulesAreHorizontal(position)
        ? ticks.map(tick => (
            <line
              x1={0}
              x2={length}
              y1={scale(tick) + offset}
              y2={scale(tick) + offset}
              style={{
                stroke: theme.colors.axis.rules,
                ...style
              }}
            />
          ))
        : ticks.map(tick => (
            <line
              x1={scale(tick) + offset}
              x2={scale(tick) + offset}
              y1={0}
              y2={length}
              style={{
                stroke: theme.colors.axis.rules,
                ...style
              }}
            />
          ))}
    </g>
  );
});
