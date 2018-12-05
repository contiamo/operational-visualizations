import { AxisAttributes, AxisComputed, AxisOptions, AxisPosition, AxisType, State } from "../typings";
import { cloneDeep } from "lodash/fp"
import { D3Selection, EventBus, StateWriter, ComponentHoverPayload, ComponentConfigInfo } from "../../shared/typings";
import * as styles from "../../shared/styles"
import { setLineAttributes, setTextAttributes, setRectAttributes } from "../../utils/d3_utils";
import Events from "../../shared/event_catalog";
import { Tick, ComputedAxisInput } from "../../axis_utils/typings";
import defaultOptions from "../../axis_utils/axis_config"

const titlePositions: Record<AxisPosition, Record<"x" | "y", number>> = {
  x1: { x: 0.5, y: 1 },
  x2: { x: 0.5, y: -1 },
  y1: { x: -1, y: 0.5 },
  y2: { x: 1, y: 0.5 },
}

const textAnchor: Record<AxisPosition, (rotateLabels?: boolean) => "start" | "middle" | "end"> = {
  x1: (rotateLabels: boolean) => (rotateLabels ? "end" : "middle"),
  x2: (rotateLabels: boolean) => (rotateLabels ? "start" : "middle"),
  y1: () => "end",
  y2: () => "start",
}

class Axis {
  computed: AxisComputed
  preComputed: AxisComputed
  el: D3Selection
  events: EventBus
  isXAxis: boolean
  options: AxisOptions
  position: AxisPosition
  state: State
  stateWriter: StateWriter
  ticks: Tick<any>[]
  type: AxisType

  constructor(state: State, stateWriter: StateWriter, events: EventBus, el: D3Selection, position: AxisPosition) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.position = position
    this.isXAxis = position[0] === "x"
    this.el = this.insertAxis(el)
    this.el.on("mouseenter", this.onComponentHover.bind(this))
  }

  private insertAxis(el: D3Selection) {
    const axisGroup = el.append("svg:g").attr("class", `axis ${this.position}`)
    const elementGroup = axisGroup.append("svg:g").attr("class", "axis-elements")
    // Background rect for component hover
    elementGroup.append("svg:rect").attr("class", styles.componentRect)
    // Border
    elementGroup.append("svg:line").attr("class", styles.axisBorder)
    return axisGroup
  }

  // Public methods
  /** Update the axis options */
  update(options: AxisOptions | ComputedAxisInput) {
    const rawOptions = options.type === "computed" ? options.computed.options : options
    this.options = { ...defaultOptions(rawOptions.type, this.position), ...rawOptions }
    this.preComputed = options.type === "computed" && options.computed
  }

  /** Check if options already contain  */
  /** Trigger axis draw/transition with new computed values */
  draw(computed: AxisComputed, duration?: number) {
    this.computed = computed
    this.ticks = this.options.hideAxis ? [] : (this.computed.ticks as Tick<any>[]).filter(tick => !tick.hideTick)
    this.translateAxis()
    this.drawTicks(duration)
    this.drawLabels(duration)
    this.drawBorder(duration)
    this.positionBackgroundRect()
    this.drawTitle()
  }

  /** Calculates the amount of space required by the axis, and positions the axis accordingly */
  adjustMargins() {
    let requiredMargin = this.computeRequiredMargin()

    // Add space for flags
    const flagAxis = this.state.current.getComputed().series.axesWithFlags[this.position]
    requiredMargin = requiredMargin + (flagAxis ? flagAxis.axisPadding : 0)

    const computedMargins = this.state.current.getComputed().axes.margins || {}
    if (computedMargins[this.position] === requiredMargin) {
      return
    }
    computedMargins[this.position] = requiredMargin
    this.stateWriter("margins", computedMargins)
    this.translateAxis()
  }

  /** Removes axis */
  close() {
    this.el.node().remove()
  }

  // Drawing
  /** Moves axis to correct position in canvas */
  private translateAxis() {
    const drawingDims = this.state.current.getComputed().canvas.drawingDims
    const axisPosition = [
      this.position === "y2" ? drawingDims.width : 0,
      this.position === "x1" ? drawingDims.height : 0
    ]
    this.el.attr("transform", `translate(${axisPosition.join(",")})`)
  }

  /** Renders tick lines */
  private drawTicks(duration?: number) {
    const attributes = this.getTickAttributes()

    const ticks = this.el
      .select("g.axis-elements")
      .selectAll(`line.${styles.axisTick}`)
      .data(this.options.showTicks ? this.ticks : [], String)

    ticks
      .enter()
      .append("svg:line")
      .call(setLineAttributes, attributes)
      .merge(ticks)
      .attr("class", styles.axisTick)
      .call(setLineAttributes, attributes, duration)

    ticks.exit().remove()
  }

  private getTickAttributes() {
    return {
      x1: (d: Tick<any>) => this.isXAxis ? d.position : 0,
      x2: (d: Tick<any>) => this.isXAxis ? d.position : Math.sign(this.options.labelOffset) * this.options.tickLength,
      y1: (d: Tick<any>) => this.isXAxis ? 0 : d.position,
      y2: (d: Tick<any>) => this.isXAxis ? Math.sign(this.options.labelOffset) * this.options.tickLength : d.position,
    }
  }

  /** Renders tick labels */
  private drawLabels(duration?: number) {
    const attributes = this.getAttributes()
    const startAttributes = this.getStartAttributes(attributes)

    const labels = this.el
      .select("g.axis-elements")
      .selectAll(`text.${styles.axisLabel}`)
      .data(this.options.showLabels ? this.ticks : [], String)

    labels
      .enter()
      .append("svg:text")
      .attr("class", styles.axisLabel)
      .merge(labels)
      .call(setTextAttributes, startAttributes)
      .style("font-size", `${this.options.fontSize}px`)
      .call(setTextAttributes, attributes, duration)

    labels.exit().remove()
  }

  private getAttributes(): AxisAttributes {
    const attrs: any = {
      x: (d: Tick<any>) => this.isXAxis ? d.position : 0,
      y: (d: Tick<any>) => this.isXAxis ? 0 : d.position,
      dx: this.isXAxis ? 0 : this.options.labelOffset,
      dy: this.isXAxis
        ? this.options.labelOffset + (this.position === "x1" ? this.options.fontSize : 0)
        : Math.abs(this.options.labelOffset / 2),
      text: (d: Tick<any>) => d.label,
      textAnchor: textAnchor[this.position](this.options.rotateLabels),
    }

    attrs.transform = this.options.rotateLabels
      ? (d: Tick<any>) => `rotate(-45, ${attrs.x(d) + attrs.dx}, ${attrs.y(d) + attrs.dy})`
      : ""

    return attrs
  }

  private getStartAttributes(attributes: AxisAttributes): AxisAttributes {
    const startAttributes = cloneDeep(attributes)
    startAttributes[this.isXAxis ? "x" : "y"] = (d: Tick<any>) => d.position
    startAttributes.transform = this.options.rotateLabels
      ? (d: Tick<any>) =>
          `rotate(-45, ${startAttributes.x(d) + startAttributes.dx}, ${startAttributes.y(d) + startAttributes.dy})`
      : ""
    return startAttributes
  }

  /** Renders axis border line */
  private drawBorder(duration?: number) {
    const border = {
      x1: this.isXAxis ? this.computed.range[0] : 0,
      x2: this.isXAxis ? this.computed.range[1] : 0,
      y1: this.isXAxis ? 0 : this.computed.range[0],
      y2: this.isXAxis ? 0 : this.computed.range[1],
    }
    this.el.select(`line.${styles.axisBorder}`).call(setLineAttributes, border, duration)
  }

  private computeRequiredMargin = () => {
    const axisDimension = this.el.node().getBBox()[this.isXAxis ? "height" : "width"]
    return Math.max(this.options.margin, Math.ceil(axisDimension) + (axisDimension ? this.options.outerPadding : 0))
  }

  /** Positions and sizes the axis background rect to ensure proper hovering behaviour */
  private positionBackgroundRect() {
    // Remove current background rect attributes so they do not affect the group dimension calculation.
    this.el.selectAll(`rect.${styles.componentRect}`).call(setRectAttributes, {})

    // Position background rect only once axis has finished transitioning.
    setTimeout(() => {
      // Position background rect
      const group = this.el.node().getBBox()
      this.el.selectAll("rect").call(setRectAttributes, {
        x: this.position === "y1" ? -group.width : group.x,
        y: this.position === "x2" ? -group.height : group.y,
        width: group.width,
        height: group.height,
      })
    }, this.state.current.getConfig().duration)
  }

  /** Adds/updates/removes the axis title */
  private drawTitle() {
    const attributes = this.getTitleAttributes()

    const title = this.el.selectAll("text.title").data(this.options.title && !this.options.hideAxis ? [this.options.title] : [])

    title.exit().remove()

    title
      .enter()
      .append("svg:text")
      .attr("class", "title")
      .merge(title)
      .attr("font-size", this.options.titleFontSize)
      .call(setTextAttributes, attributes)
  }

  private getTitleAttributes() {
    const elBox = (this.el.select("g.axis-elements").node() as any).getBBox()
    const titlePosition = titlePositions[this.position]
    const width = this.position[0] === "x" ? this.computed.length : elBox.width
    const height = this.position[0] === "x" ? elBox.height : Math.abs(this.computed.length)
    const x = (width + (this.position[0] === "y" ? this.options.titleFontSize : 0)) * titlePosition.x
    const y = (height + (this.position[0] === "x" ? this.options.titleFontSize : 0)) * titlePosition.y
    const rotation = this.position[0] === "y" ? -90 : 0
    return {
      x,
      y,
      text: String,
      textAnchor: "middle",
      transform: `rotate(${rotation}, ${x}, ${y})`,
    }
  }

  // Event handlers
  private onComponentHover() {
    const payload: ComponentHoverPayload = { component: this.el, options: this.hoverInfo() }
    this.events.emit(Events.FOCUS.COMPONENT.HOVER, payload)
  }

  private hoverInfo(): ComponentConfigInfo {
    return {
      key: this.position,
      type: "axis",
    }
  }
}

export default Axis
