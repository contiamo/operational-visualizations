import * as React from "react"
import theme from "../utils/constants"
import { AxisComputed, AxisPosition, Tick, AxisOptions } from "../Chart/typings";
import * as styles from "../shared/styles"

export interface AxisProps {
  data: AxisComputed;
  position: AxisPosition;
  width: number;
  margins: string;
}

const labelStyle = (options: AxisOptions, axis: AxisPosition): React.CSSProperties => ({
  fontSize: options.fontSize,
  textAnchor: ["x1", "x2"].includes(axis) ? "middle" : (axis === "y1" ? "end" : "start")
})

class Axis extends React.Component<AxisProps, {}> {
  isHorizontal: boolean;

  tickPosition(tick: Tick<any>) {
    switch(this.props.position) {
      case "x1": return {
        x1: tick.position - this.props.data.range[0],
        x2: tick.position - this.props.data.range[0],
        y1: 0,
        y2: this.props.data.options.tickLength,
      }
      case "x2": return {
        x1: tick.position - this.props.data.range[0],
        x2: tick.position - this.props.data.range[0],
        y1: this.props.width,
        y2: this.props.width - this.props.data.options.tickLength,
      }
      case "y1": return {
        x1: this.props.width,
        x2: this.props.width - this.props.data.options.tickLength,
        y1: tick.position - this.props.data.range[1],
        y2: tick.position - this.props.data.range[1],
      }
      case "y2": return {
        x1: 0,
        x2: this.props.data.options.tickLength,
        y1: tick.position - this.props.data.range[1],
        y2: tick.position - this.props.data.range[1],
      }
    }
  }

  labelPosition(tick: Tick<any>) {
    switch(this.props.position) {
      case "x1": return {
        x: tick.position - this.props.data.range[0],
        y: this.props.data.options.labelOffset,
        dy: this.props.data.options.fontSize
      }
      case "x2": return {
        x: tick.position - this.props.data.range[0],
        y: this.props.width + this.props.data.options.labelOffset,
        dy: 0
      }
      case "y1": return {
        x: this.props.width + this.props.data.options.labelOffset,
        y: tick.position - this.props.data.range[1],
        dy: this.props.data.options.fontSize * 0.35
      }
      case "y2": return {
        x: this.props.data.options.labelOffset,
        y: tick.position - this.props.data.range[1],
        dy: this.props.data.options.fontSize * 0.35
      }
    }
  }

  borderWidth() {
    switch(this.props.position) {
      case "x1": return "1px 0 0 0";
      case "x2": return "0 0 1px 0";
      case "y1": return "0 1px 0 0";
      case "y2": return "0 0 0 1px";
    }
  }

  containerStyle() {
    return {
      borderStyle: "solid",
      borderColor: theme.colors.axis.border,
      overflow: "visible",
      borderWidth: this.borderWidth(),
      margin: this.props.margins,
      ...this.isHorizontal
        ? {
          width: this.props.data.length,
          height: this.props.width,
        }
        : {
          width: this.props.width,
          height: this.props.data.length,
        }
    }
  }

  render() {
    this.isHorizontal = this.props.position[0] === "x"
    return (
      <svg style={this.containerStyle()}>
        {(this.props.data.ticks as Array<Tick<any>>).map((tick, i) => {
          const position = this.labelPosition(tick)
          const transform = this.props.data.options.rotateLabels ? `rotate(-45, ${position.x}, ${position.y + position.dy})` : ""
          return (
            <>
              <line {...this.tickPosition(tick)} className={styles.axisTick} key={i}></line>
              <text {...position} transform={transform} className={styles.axisLabel} style={labelStyle(this.props.data.options, this.props.position)}>{tick.label}</text>
            </>
          )
        })}
      </svg>
    )
  }
}

export default Axis
