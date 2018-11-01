import Axis from "./axes/axis"
import Rules from "./rules"
import { assign, defaults, difference, find, flow, forEach, get, invoke, keys, map, mapValues, omitBy, pick, pickBy, uniqBy, values } from "lodash/fp"
import { AxisConfig, AxisOptions, AxisOrientation, AxisPosition, AxisType, D3Selection, EventBus, State, StateWriter } from "./typings"
import computeQuantAxes from "../axis_utils/compute_quant_axes"
import computeCategoricalAxis from "../axis_utils/compute_categorical_axis"
import computeTimeAxis from "../axis_utils/compute_time_axis"

const generalAxisConfig = {
  fontSize: 11,
  titleFontSize: 12,
  showTicks: true,
}

const xAxisConfig = defaults(generalAxisConfig)({
  margin: 15,
  minTicks: 2,
  rotateLabels: false,
  tickSpacing: 65,
  outerPadding: 3,
})

const yAxisConfig = defaults(generalAxisConfig)({
  margin: 34,
  minTicks: 4,
  minTopOffsetTopTick: 21,
  rotateLabels: false,
  tickSpacing: 40,
  outerPadding: 3,
})

const axisConfig: Record<AxisPosition, AxisConfig> = {
  x1: assign({ tickOffset: 8 })(xAxisConfig),
  x2: assign({ tickOffset: -8 })(xAxisConfig),
  y1: assign({ tickOffset: -8 })(yAxisConfig),
  y2: assign({ tickOffset: 8 })(yAxisConfig),
}

const configValuesForAxis: Record<AxisType, string[]> = {
  quant: ["numberFormatter"],
  categorical: [
    "innerBarSpacingCategorical",
    "innerBarSpacing",
    "minBarWidth"
  ],
  time: [
    "innerBarSpacing",
    "outerBarSpacing",
    "minBarWidth"
  ]
}

type Axes = Partial<Record<AxisPosition, Axis>>;

class AxesManager {
  axes: Axes = {}
  els: { [key: string]: D3Selection }
  events: EventBus
  oldAxes: Axes = {}
  rules: { [key: string]: Rules } = {}
  state: State
  stateWriter: StateWriter

  constructor(state: State, stateWriter: StateWriter, events: EventBus, els: { [key: string]: D3Selection }) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.els = els
  }

  draw(): void {
    this.updateAxes()
    forEach(invoke("close"))(this.oldAxes)
    this.drawAxes()
    forEach(invoke("adjustMargins"))(this.axes)
    this.events.emit("margins:update")
    this.drawAxes()
  }

  updateMargins(): void {
    const defaultMargins: { [key: string]: number } = {
      x1: xAxisConfig.margin,
      x2: xAxisConfig.margin,
      y1: yAxisConfig.margin,
      y2: yAxisConfig.margin,
    }
    const computedMargins: { [key: string]: number } = defaults(defaultMargins)(
      get(["axes", "margins"])(this.state.current.getComputed()) || {},
    )
    this.stateWriter("margins", computedMargins)
  }

  private updateAxes(): void {
    this.stateWriter("previous", {})
    this.stateWriter("computed", {})

    // Check all required axes have been configured
    const requiredAxes = keys(this.state.current.getComputed().series.dataForAxes)
    const axesOptions = this.state.current.getAccessors().data.axes(this.state.current.getData())
    const undefinedAxes = difference(requiredAxes)(keys(axesOptions))
    if (undefinedAxes.length) {
      throw new Error(`The following axes have not been configured: ${undefinedAxes.join(", ")}`)
    }
    this.stateWriter("requiredAxes", requiredAxes)

    // Remove axes that are no longer needed, or whose type has changed
    const axesToRemove = omitBy(
      (axis: Axis, key: AxisPosition): boolean => {
        return !axesOptions[key] || axesOptions[key].type === axis.type
      },
    )(this.axes)
    forEach.convert({ cap: false })(this.removeAxis.bind(this))(axesToRemove)
    // Create or update currently required axes
    forEach.convert({ cap: false })(this.createOrUpdate.bind(this))(axesOptions)
    this.setBaselines()
    this.stateWriter("priorityTimeAxis", this.priorityTimeAxis())
  }

  private createOrUpdate(options: Partial<AxisOptions>, position: AxisPosition): void {
    const fullOptions = defaults(axisConfig[position])(options)
    const existing = this.axes[position]
    existing ? this.update(position, fullOptions) : this.create(position, fullOptions)
  }

  private create(position: AxisPosition, options: AxisOptions): void {
    const el = this.els[`${position[0]}Axes`]
    const axis = new Axis(this.state, this.stateWriter, this.events, el, position)
    this.axes[position] = axis as Axis
    this.update(position, options)
  }

  private update(position: AxisPosition, options: AxisOptions): void {
    this.axes[position].update(options)
  }

  private setBaselines(): void {
    const xType = (this.axes.x1 || this.axes.x2).type
    const yType = (this.axes.y1 || this.axes.y2).type
    const baseline: AxisOrientation = xType === "quant" && yType !== "quant" ? "y" : "x"
    this.stateWriter("baseline", baseline)
  }

  private priorityTimeAxis(): AxisPosition {
    return find((axis: AxisPosition): boolean => this.axes[axis] && this.axes[axis].type === "time")(
      this.state.current.getConfig().timeAxisPriority,
    )
  }

  private drawAxes() {
    forEach(this.drawAxesByOrientation.bind(this))(["y", "x"])
  }

  private drawAxesByOrientation(orientation: "x" | "y") {
    const axes: Axes = pickBy(
      (axis: Axis) => orientation === "x" ? axis.isXAxis : !axis.isXAxis
    )(this.axes)

    const computedAxes = this.computeAxes(axes, orientation)

    forEach((axis: AxisPosition) => {
      this.stateWriter(["previous", axis], this.state.current.getComputed().axes.computed[axis] || computedAxes[axis])
      this.stateWriter(["computed", axis], computedAxes[axis])
    })(keys(computedAxes))

    // Update rules
    this.updateRules(orientation)

    forEach((axis: Axis) => {
      axis.draw(computedAxes[axis.position], this.state.current.getConfig().duration)
    })(axes)
  }

  private computeAxes(axes: Partial<Record<AxisPosition, Axis>>, orientation: "x" | "y") {
    const computed = this.state.current.getComputed()

    const axesTypes: AxisType[] = flow(
      values,
      map((axis: Axis) => axis.options.type),
      uniqBy(String),
    )(axes)

    if (axesTypes.length > 1) {
      throw new Error(`Axes of types ${axesTypes.join(", ")} cannot be aligned`)
    }

    const range: [number, number] = orientation === "x"
      ? [0, computed.canvas.drawingDims.width]
      : [computed.canvas.drawingDims.height, 0]

    const inputData = mapValues.convert({ cap: false })((axis: Axis, key: AxisPosition) => ({
      range,
      values: computed.series.dataForAxes[key],
      options: axis.options,
    }))(axes)

    const config = pick(configValuesForAxis[axesTypes[0]])(this.state.current.getConfig())
    const computedSeries = pick(["barSeries", "barIndices"])(this.state.current.getComputed().series)

    switch (axesTypes[0]) {
      case "quant":
        return computeQuantAxes(inputData, config);
      case "categorical":
        return computeCategoricalAxis(inputData, config, computedSeries);
      case "time":
        return computeTimeAxis(inputData, config, computedSeries);
    }
  }

  updateRules(orientation: AxisOrientation): void {
    const rules = this.rules[orientation] || new Rules(this.state, this.els[`${orientation}Rules`], orientation)
    this.rules[orientation] = rules
    rules.draw()
  }

  private removeAxis(axis: Axis, position: AxisPosition): void {
    this.oldAxes[position] = axis
    this.axes[position] = null
  }
}

export default AxesManager
