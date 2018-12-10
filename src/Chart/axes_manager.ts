import Axis from "./axes/axis"
import Rules from "./axes/rules"
import { difference, every, find, flow, forEach, get, invoke, isEmpty, keys, map, mapValues, omitBy, pickBy, uniqBy, values } from "lodash/fp"
import { AxisOptions, AxisPosition, AxisType, D3Selection, EventBus, State, StateWriter } from "./typings"
import computeQuantAxes from "../axis_utils/compute_quant_axes"
import computeCategoricalAxes from "../axis_utils/compute_categorical_axes"
import computeTimeAxes, { ticksInDomain } from "../axis_utils/compute_time_axes"
import { defaultMargins } from "../axis_utils/axis_config"
import { ComputedAxisInput, Extent, AxisOrientation, InputDatum, AxisRecord } from "../axis_utils/typings";
import { computeBarPositions } from "../axis_utils/discrete_axis_utils";

type Axes = AxisRecord<Axis>;

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
    const computedMargins: Record<AxisPosition, number> = {
      ...defaultMargins(this.state.current.getConfig().noAxisMargin),
      ...get(["axes", "margins"])(this.state.current.getComputed()) || {}
    }
    this.stateWriter("margins", computedMargins)
  }

  private updateAxes(): void {
    this.stateWriter("previous", {})
    this.stateWriter("computed", {})

    // Check all required axes have been configured
    const requiredAxes = keys(this.state.current.getComputed().series.dataForAxes)
    const configuredAxes = this.state.current.getAccessors().data.axes(this.state.current.getData())

    const undefinedAxes = difference(requiredAxes)(keys(configuredAxes))
    if (undefinedAxes.length) {
      throw new Error(`The following axes have not been configured: ${undefinedAxes.join(", ")}`)
    }
    this.stateWriter("requiredAxes", requiredAxes)

    // Remove axes that are no longer needed, or whose type has changed
    const axesToRemove = omitBy(
      (axis: Axis, key: AxisPosition) => !configuredAxes[key] || configuredAxes[key].type === axis.type
    )(this.axes)
    forEach.convert({ cap: false })(this.removeAxis.bind(this))(axesToRemove)

    // Create or update currently required axes
    forEach.convert({ cap: false })(this.createOrUpdate.bind(this))(configuredAxes)
    this.setBaselines()
    this.stateWriter("priorityTimeAxis", this.priorityTimeAxis())
  }

  private createOrUpdate(options: AxisOptions | ComputedAxisInput, position: AxisPosition) {
    const existing = this.axes[position]
    existing ? this.update(position, options) : this.create(position, options)
  }

  private create(position: AxisPosition, options: AxisOptions | ComputedAxisInput) {
    const el = this.els[`${position[0]}Axes`]
    const axis = new Axis(this.state, this.stateWriter, this.events, el, position)
    this.axes[position] = axis
    this.update(position, options)
  }

  private update(position: AxisPosition, options: AxisOptions | ComputedAxisInput) {
    this.axes[position].update(options)
  }

  private setBaselines() {
    const xType = (this.axes.x1 || this.axes.x2).options.type
    const yType = (this.axes.y1 || this.axes.y2).options.type
    const baseline: AxisOrientation = xType === "quant" && yType !== "quant" ? "y" : "x"
    this.stateWriter("baseline", baseline)
  }

  private priorityTimeAxis(): AxisPosition {
    return find((axis: AxisPosition): boolean => this.axes[axis] && this.axes[axis].options.type === "time")(
      this.state.current.getConfig().timeAxisPriority,
    )
  }

  private drawAxes() {
    forEach(this.drawAxesByOrientation.bind(this))(["y", "x"])
  }

  private drawAxesByOrientation(orientation: AxisOrientation) {
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

  // Returns common type of multiple axes. If axes do not all have the same type, throws an error.
  private getAxesType(axes: Axes) {
    const axesTypes: AxisType[] = flow(
      values,
      map((axis: Axis) => axis.options.type),
      uniqBy(String),
    )(axes)

    if (axesTypes.length > 1) {
      throw new Error(`Axes of types ${axesTypes.join(", ")} cannot be aligned`)
    }
    return axesTypes[0];
  }

  // Checks if axes have already been computed externally.
  private areAxesPrecomputed(axes: Axes) {
    const alreadyComputed: boolean[] = flow(
      values,
      map((axis: Axis) => !!axis.preComputed),
      uniqBy(Boolean)
    )(axes)

    if (alreadyComputed.length > 1) {
      throw new Error("Axes with the same orientation must either both be pre-computed, or neither pre-computed.")
    }
    return alreadyComputed[0];
  }

  private getAxesRange(axes: Axes, precomputed: boolean, orientation: AxisOrientation): Extent {
    const computed = this.state.current.getComputed()
    if (precomputed) {
      const ranges: Extent[] = map((axis: Axis) => axis.preComputed.range)(values(axes))
      const rangesAreEqual = every((range: Extent) => range[0] === ranges[0][0] && range[1] === ranges[0][1])(ranges)
      if (!rangesAreEqual) {
        throw new Error(`Ranges ${keys(axes).join(", ")} should have the same range.`)
      }
      return ranges[0]
    }
    return orientation === "x"
      ? [0, computed.canvas.drawingDims.width]
      : [computed.canvas.drawingDims.height, 0]
  }

  private getNTicks(axes: Axes) {
    return Math.max(...keys(axes).map(axis => {
      const axisOptions = axes[axis].options
      return axisOptions.type === "time"
        ? ticksInDomain(axisOptions).length
        : this.state.current.getComputed().series.dataForAxes[axis].length
    }))
  }

  private computeAxes(axes: Axes, orientation: AxisOrientation) {
    const computedSeries = this.state.current.getComputed().series
    const precomputed = this.areAxesPrecomputed(axes)

    // Get available range for axis
    let range = this.getAxesRange(axes, precomputed, orientation)
    const type = this.getAxesType(axes)

    // Check if axis needs to be adjusted to account for the width of bars.
    // Bars can only be rendered on discrete (categorical or time) axes.
    const hasBars = type !== "quant" && !isEmpty(computedSeries.barSeries)
    if (hasBars) {
      const nTicks = this.getNTicks(axes)
      const barPositions = computeBarPositions(range, nTicks, this.state.current.getConfig(), computedSeries.barSeries)
      this.stateWriter("barPositions", barPositions)
      const config = this.state.current.getConfig()

      const tickWidth = (uniqBy(barPositions.offset)(keys(computedSeries.barSeries)) as string[]).reduce<number>((width, seriesKey) =>
        width + barPositions.width(seriesKey) + config.innerBarSpacing
      , config.outerBarSpacing - config.innerBarSpacing)

      // Update range
      range = orientation === "x" ? [0, tickWidth * nTicks] : [tickWidth * nTicks, 0]
    }

    // If axes have been computed before being passed to the chart, no further computation is necessary
    if (precomputed) {
      return mapValues((axis: Axis) => axis.preComputed)(axes)
    }

    // Pass computed range, values, options and tickWidth to appropriate axis calculator.
    const inputData = mapValues.convert({ cap: false })((axis: Axis, key: AxisPosition): InputDatum => ({
      range,
      values: computedSeries.dataForAxes[key],
      options: axis.options,
    }))(axes)

    switch (type) {
      case "quant":
        return computeQuantAxes(inputData, this.state.current.getConfig().numberFormatter);
      case "categorical":
        return computeCategoricalAxes(mapValues((datum: InputDatum) => ({ ...datum, hasBars }))(inputData));
      case "time":
        return computeTimeAxes(mapValues((datum: InputDatum) => ({ ...datum, hasBars }))(inputData));
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
