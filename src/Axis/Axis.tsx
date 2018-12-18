import * as React from "react";
import { AxisComputed, AxisPosition, FullAxisOptions, Tick } from "../Chart/typings";
import * as styles from "../shared/styles";
import theme from "../utils/constants";

export interface AxisProps {
  data: AxisComputed;
  position: AxisPosition;
  width: number;
  margins: string;
}

const labelStyle = (options: FullAxisOptions, axis: AxisPosition): React.CSSProperties => ({
  fontSize: options.fontSize,
  textAnchor: ["x1", "x2"].includes(axis) ? "middle" : axis === "y1" ? "end" : "start",
});

const tickPosition = (tick: Tick<any>, { position, data, width }: AxisProps) => {
  switch (position) {
    case "x1":
      return {
        x1: tick.position - data.range[0],
        x2: tick.position - data.range[0],
        y1: 0,
        y2: data.options.tickLength,
      };
    case "x2":
      return {
        x1: tick.position - data.range[0],
        x2: tick.position - data.range[0],
        y1: width,
        y2: width - data.options.tickLength,
      };
    case "y1":
      return {
        x1: width,
        x2: width - data.options.tickLength,
        y1: tick.position - data.range[1],
        y2: tick.position - data.range[1],
      };
    case "y2":
      return {
        x1: 0,
        x2: data.options.tickLength,
        y1: tick.position - data.range[1],
        y2: tick.position - data.range[1],
      };
  }
};

const borderWidth = (position: AxisProps["position"]) => {
  switch (position) {
    case "x1":
      return "1px 0 0 0";
    case "x2":
      return "0 0 1px 0";
    case "y1":
      return "0 1px 0 0";
    case "y2":
      return "0 0 0 1px";
  }
};

const labelPosition = (tick: Tick<any>, { position, data, width }: AxisProps) => {
  switch (position) {
    case "x1":
      return {
        x: tick.position - data.range[0],
        y: data.options.labelOffset,
        dy: data.options.fontSize,
      };
    case "x2":
      return {
        x: tick.position - data.range[0],
        y: width + data.options.labelOffset,
        dy: 0,
      };
    case "y1":
      return {
        x: width + data.options.labelOffset,
        y: tick.position - data.range[1],
        dy: data.options.fontSize * 0.35,
      };
    case "y2":
      return {
        x: data.options.labelOffset,
        y: tick.position - data.range[1],
        dy: data.options.fontSize * 0.35,
      };
  }
};

const containerStyle = ({ position, margins, data, width }: AxisProps) => ({
  borderStyle: "solid",
  borderColor: theme.colors.axis.border,
  overflow: "visible",
  borderWidth: borderWidth(position),
  margin: margins,
  ...(position[0] === "x"
    ? {
        width: data.length,
        height: width,
      }
    : {
        width,
        height: data.length,
      }),
});

const Axis: React.SFC<AxisProps> = props => (
  <svg style={containerStyle(props)}>
    {(props.data.ticks as Tick[]).map((tick, i) => {
      const position = labelPosition(tick, props);
      const transform = props.data.options.rotateLabels
        ? `rotate(-45, ${position.x}, ${position.y + position.dy})`
        : "";
      return (
        <React.Fragment key={i}>
          <line {...tickPosition(tick, props)} className={styles.axisTick} />
          <text
            {...position}
            transform={transform}
            className={styles.axisLabel}
            style={labelStyle(props.data.options, props.position)}
          >
            {tick.label}
          </text>
        </React.Fragment>
      );
    })}
  </svg>
);

export default Axis;
