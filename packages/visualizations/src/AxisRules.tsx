import React from "react";
import { useChartTransform } from "./Chart";
import { ScaleBand, ScaleLinear } from "d3-scale";
import theme from "./theme";

interface AxisRulesProps {
  scale: ScaleLinear<number, number> | ScaleBand<string>;
  // left | right | bottom | top
  position: "left" | "right" | "bottom" | "top";
  length: number;
  transform?: React.SVGAttributes<SVGRectElement>["transform"];
  style?: React.SVGAttributes<SVGGElement>["style"];
}

const rulesAreHorizontal = (position: AxisRulesProps["position"]) => ["left", "right"].includes(position);

export const AxisRules = React.memo((props: AxisRulesProps) => {
  const defaultTransform = useChartTransform();

  const { scale, position, length, transform, style } = props;

  const ticks: any[] = "ticks" in scale ? scale.ticks() : scale.domain();

  const offset = "ticks" in scale ? 0 : -(scale.paddingOuter() * scale.bandwidth()) / 2;

  return (
    <g transform={transform || defaultTransform}>
      {rulesAreHorizontal(position)
        ? ticks.map(tick => {
            const y = scale(tick);
            if (y === undefined) return null;
            return (
              <line
                x1={0}
                x2={length}
                y1={y + offset}
                y2={y + offset}
                style={{
                  stroke: theme.colors.axis.rules,
                  ...style,
                }}
              />
            );
          })
        : ticks.map(tick => {
            const x = scale(tick);
            if (x === undefined) return null;
            return (
              <line
                x1={x + offset}
                x2={x + offset}
                y1={0}
                y2={length}
                style={{
                  stroke: theme.colors.axis.rules,
                  ...style,
                }}
              />
            );
          })}
    </g>
  );
});
