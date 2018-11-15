import { D3Selection, Rule, State } from "../typings"
import * as styles from "../../shared/styles"

class Rules {
  el: D3Selection
  orientation: "x" | "y"
  state: State
  yRules: boolean

  constructor(state: State, el: D3Selection, orientation: "x" | "y") {
    this.state = state
    this.el = el
    this.orientation = orientation
    this.yRules = this.orientation === "y"
  }

  draw(): void {
    const computedAxes = this.state.current.getComputed().axes.computed
    const axisComputed = computedAxes[`${this.orientation}1`] || computedAxes[`${this.orientation}2`]
    const data = axisComputed.rules
    const attributes = this.attributes()

    const rules = this.el.selectAll(`line.${styles.rules}`).data(data, String)

    rules
      .exit()
      .transition()
      .duration(this.state.current.getConfig().duration)
      .attr("x1", attributes.x1)
      .attr("x2", attributes.x2)
      .attr("y1", attributes.y1)
      .attr("y2", attributes.y2)
      .style("opacity", 1e-6)
      .remove()

    rules
      .enter()
      .append("svg:line")
      .attr("class", (d: Rule) => `rule ${styles.rules} ${d.class}`)
      .attr("x1", attributes.x1)
      .attr("x2", attributes.x2)
      .attr("y1", attributes.y1)
      .attr("y2", attributes.y2)
      .merge(rules)
      .transition()
      .duration(this.state.current.getConfig().duration)
      .attr("x1", attributes.x1)
      .attr("x2", attributes.x2)
      .attr("y1", attributes.y1)
      .attr("y2", attributes.y2)
  }

  private attributes() {
    const drawingDims = this.state.current.getComputed().canvas.drawingDims
    return {
      x1: (d: Rule) => this.yRules ? 0 : d.position,
      x2: (d: Rule) => this.yRules ? drawingDims.width : d.position,
      y1: (d: Rule) => this.yRules ? d.position : 0,
      y2: (d: Rule) => this.yRules ? d.position : drawingDims.height,
    }
  }

  close(): void {
    this.el.node().remove()
  }
}

export default Rules
