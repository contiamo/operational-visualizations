import { extent as d3Extent, range as d3Range } from "d3-array"
import { rangeStep, mapValues, keys } from "lodash/fp"
import { AxisComputed, AxisPosition, Extent, InputData, InputDatum, QuantAxisOptions, Tick} from "./typings"
import * as d3 from "d3-selection"
import { scaleLinear, ScaleLinear } from "d3-scale";

interface Config {
  numberFormatter: (value: number) => string
}

type Steps = [number, number, number];

type InitialComputedDatum = InputDatum<number, QuantAxisOptions> & {
  domain: Extent;
  tickSteps: Steps;
  labelSteps: Steps;
  ruleSteps: Steps;
}

const tuple = <T extends string[]>(...args: T) => args;
const STEPS_TO_ALIGN = tuple("tickSteps", "labelSteps", "ruleSteps");
type StepsToAlign = typeof STEPS_TO_ALIGN[number];

const computeDomain = (data: number[], start: number, end: number): Extent => {
  if (end < start) {
    throw new Error("Start value cannot be greater than end value.")
  }
  const extent = extentCushion(guess(data))
  return [start || extent[0], end || extent[1]]
}

// Increase the extent by 5% on both sides (so that there's some space
// between the drawings and the borders of the chart), unless one of the ends
// equals 0
const extentCushion = (extent: Extent): Extent => {
  const distance: number = extent[1] - extent[0]
  return [
    extent[0] !== 0 ? extent[0] - 0.05 * distance : extent[0],
    extent[1] !== 0 ? extent[1] + 0.05 * distance : extent[1],
  ]
}

// Guess start, end from data
export const guess = (data: number[] = []): Extent => {
  const extent = d3Extent(data)

  // If this axis is user configured but does not currently have any data,
  // we still need to guess some extent here - otherwise animations will blow up
  if (!extent[0]) {
    return [0, 100]
  }

  // Start and end are the same
  if (extent[0] === extent[1]) {
    const val: number = extent[0]
    // This is somewhat arbitrary but we have to come up with something...
    // We return here as no further processing (smart, cut, zero) is possible
    return val === 0
      ? [0, 100]
      : // Make sure axis has right direction
        val < 0
        ? [2 * val, 0]
        : [0, 2 * val]
  }

  // Ensure domain includes zero
  extent[0] = extent[0] > 0 ? 0 : extent[0]
  extent[1] = extent[1] < 0 ? 0 : extent[1]

  return extent
}

const stepScaleFactors = (step: number): number[] =>
  step === 1 ? [10, 5, 2, 1] : rangeStep(0.5)(0, 10)

export const computeTickNumber = (range: Extent, tickSpacing: number, minTicks: number = 0): number => {
  const length = Math.abs(range[0]) + Math.abs(range[1])
  return Math.max(Math.floor(length / tickSpacing), minTicks)
}

// Computes nice steps (for ticks) given a domain [start, stop] and a
// wanted number of ticks (number of ticks returned might differ
// by a few ticks)
const computeInterval = (range: Extent, domain: Extent, options: QuantAxisOptions) => {
  const tickNumber = computeTickNumber(range, options.tickSpacing, options.minTicks)
  const span = domain[1] - domain[0]
  let step = Math.pow(10, Math.floor(Math.log(Math.abs(span) / tickNumber) / Math.LN10)) * (span < 0 ? -1 : 1)

  let scaleFactor: number
  if (options.end) {
    // If a value has been explicitly set for options.end, there must be a tick at this value
    const validScaleFactors = stepScaleFactors(step).filter(val => (span / (step * val)) % 1 === 0)
    // Choose scale factor which gives a number of ticks as close as possible to tickNumber
    scaleFactor = validScaleFactors.sort(val => Math.abs(span / (val * step) - tickNumber))[0]
  } else {
    const err = (tickNumber / span) * step
    const errorMapper: Array<[boolean, number]> = [[err <= 0.15, 10], [err <= 0.35, 5], [err <= 0.75, 2], [true, 1]]
    scaleFactor = errorMapper.find(val => val[0])[1]
  }
  step *= scaleFactor
  return step
}

const computeTickArray = (datum: InitialComputedDatum, scale: ScaleLinear<number, number>, formatter: (value: number) => string): Tick[] => {
  const ticks = computeTickValues(datum.tickSteps)
  const labels = computeTickValues(datum.labelSteps)

  return ticks.map(tickVal => ({
    position: scale(tickVal),
    ...{
      label: labels.includes(tickVal) && formatter(tickVal),
      class: tickVal === 0 && "zero"
    }
  }))
}

const computeTickSteps = (range: Extent, domain: Extent, options: QuantAxisOptions): Steps => {
  const defaultInterval = options.interval || computeInterval(range, domain, options)
  const interval = options.tickInterval ? Math.min(options.tickInterval, defaultInterval) : defaultInterval
  return computeSteps(domain, interval, options)
}

const computeLabelSteps = (range: Extent, domain: Extent, options: QuantAxisOptions): Steps => {
  const interval = options.interval || computeInterval(range, domain, options)
  return computeSteps(domain, interval, options)
}

const computeRuleSteps = (range: Extent, domain: Extent, options: QuantAxisOptions): Steps => {
  const interval = options.ruleInterval || options.interval || computeInterval(range, domain, options)
  return computeSteps(domain, interval, options)
}

const computeTickValues = (steps: Steps): number[] => {
  return [...d3Range.apply(d3, steps), steps[1]]
}

const computeSteps = (domain: Extent, interval: number, options: QuantAxisOptions): Steps => {
  const steps: Steps = [options.start, options.end, interval]
  let computedStart = options.end % steps[2]
  computedStart = computedStart - (computedStart > domain[0] ? steps[2] : 0)
  steps[0] = options.start || computedStart || Math.floor(domain[0] / steps[2]) * steps[2]
  steps[1] = options.end || Math.ceil((domain[1] - steps[0]) / steps[2]) * steps[2] + steps[0]
  return steps
}

const computeRuleTicks = (steps: Steps, options: QuantAxisOptions, scale: ScaleLinear<number, number>) => {
  const values = options.showRules ? [...d3Range.apply(d3, steps), steps[1]] : []
  return values.map(value => ({
    position: scale(value),
    class: value === 0 ? "zero" : ""
  }))
}

const alignAxes = (axes: Record<AxisPosition, InitialComputedDatum>) => {
  if (keys(axes).length === 1) {
    return
  }

  const axisKeys = keys(axes)
  STEPS_TO_ALIGN.forEach((key: StepsToAlign) => {
    const one = axes[axisKeys[0]][key]
    const two = axes[axisKeys[1]][key]
    alignSteps(one, two)
    axes[axisKeys[0]][key] = one
    axes[axisKeys[1]][key] = two
  })
}

const alignSteps = (one: number[], two: number[]): void => {
  const zeroOne = containsZero(one)
  const zeroTwo = containsZero(two)

  if (zeroOne && zeroTwo) {
    const max = [Math.max(zeroOne[0], zeroTwo[0]), Math.max(zeroOne[1], zeroTwo[1])]
    one[0] = one[0] - (max[0] - zeroOne[0]) * one[2]
    one[1] = one[1] + (max[1] - zeroOne[1]) * one[2]
    two[0] = two[0] - (max[0] - zeroTwo[0]) * two[2]
    two[1] = two[1] + (max[1] - zeroTwo[1]) * two[2]
  } else {
    const stepsL = (one[1] - one[0]) / one[2]
    const stepsR = (two[1] - two[0]) / two[2]
    const stepsDiff = stepsL - stepsR
    if (stepsDiff > 0) {
      two[0] = two[0] - Math.floor(stepsDiff / 2) * two[2]
      two[1] = two[1] + Math.ceil(stepsDiff / 2) * two[2]
    } else if (stepsDiff < 0) {
      one[0] = one[0] + Math.ceil(stepsDiff / 2) * one[2]
      one[1] = one[1] - Math.floor(stepsDiff / 2) * one[2]
    }
  }
}

const containsZero = (step: number[]): [number, number] =>
  step[0] <= 0 && step[1] >= 0 ? [Math.abs(step[0] / step[2]), step[1] / step[2]] : undefined


export default (data: InputData<number, QuantAxisOptions>, config: Config): Record<AxisPosition, AxisComputed<ScaleLinear<number, number>, number>> => {
  const initialComputed = mapValues((datum: InputDatum<number, QuantAxisOptions>) => {
    const domain = computeDomain(datum.values, datum.options.start, datum.options.end)
    return {
      ...datum,
      domain,
      tickSteps: computeTickSteps(datum.range, domain, datum.options),
      labelSteps: computeLabelSteps(datum.range, domain, datum.options),
      ruleSteps: computeRuleSteps(datum.range, domain, datum.options),
    }
  })(data)

  alignAxes(initialComputed)

  return mapValues((datum: InitialComputedDatum) => {
    const tickValues = computeTickValues(datum.tickSteps)
    const scale = scaleLinear().range(datum.range).domain(d3Extent(tickValues))

    return {
      scale,
      ticks: computeTickArray(datum, scale, config.numberFormatter),
      length: Math.abs(datum.range[1] - datum.range[0]),
      rules: computeRuleTicks(datum.ruleSteps, datum.options, scale),
    }
  })(initialComputed)
}
