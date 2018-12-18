import { extent as d3Extent, range as d3Range } from "d3-array";
import { scaleLinear, ScaleLinear } from "d3-scale";
import * as d3 from "d3-selection";
import { keys, LodashMapValues, mapValues, rangeStep } from "lodash/fp";
import { tuple, WithConvert } from "../shared/typings";
import defaultNumberFormatter from "../utils/number_formatter";
import defaultOptions from "./axis_config";

import {
  AxisPosition,
  AxisRecord,
  Extent,
  FullQuantAxisOptions,
  InputData,
  InputDatum,
  QuantAxisComputed,
  QuantAxisOptions,
} from "./typings";

type Formatter = (value: number) => string;
type Datum = InputDatum<number, QuantAxisOptions>;
type Data = InputData<number, QuantAxisOptions>;
type Scale = ScaleLinear<number, number>;
type Steps = [number, number, number];

type InitialComputedDatum = InputDatum<number, FullQuantAxisOptions> & {
  domain: Extent;
  tickSteps: Steps;
  labelSteps: Steps;
  ruleSteps: Steps;
};

const STEPS_TO_ALIGN = tuple("tickSteps", "labelSteps", "ruleSteps");

type StepsToAlign = typeof STEPS_TO_ALIGN[number];

export const computeDomain = (data: number[], start?: number, end?: number): Extent => {
  if (end && start && end < start) {
    throw new Error("Start value cannot be greater than end value.");
  }
  const extent = extentCushion(guess(data));
  return [start || extent[0], end || extent[1]];
};

// Increase the extent by 5% on both sides (so that there's some space
// between the drawings and the borders of the chart), unless one of the ends
// equals 0
export const extentCushion = (extent: Extent): Extent => {
  const distance: number = extent[1] - extent[0];
  return [
    extent[0] !== 0 ? extent[0] - 0.05 * distance : extent[0],
    extent[1] !== 0 ? extent[1] + 0.05 * distance : extent[1],
  ];
};

// Guess start, end from data
export const guess = (data: number[] = []): Extent => {
  const extent = d3Extent(data);

  // If this axis is user configured but does not currently have any data,
  // we still need to guess some extent here - otherwise animations will blow up
  if (!extent[0]) {
    return [0, 100];
  }

  // Start and end are the same
  if (extent[0] === extent[1]) {
    const val: number = extent[0];
    // This is somewhat arbitrary but we have to come up with something...
    // We return here as no further processing (smart, cut, zero) is possible
    return val === 0
      ? [0, 100]
      : // Make sure axis has right direction
      val < 0
      ? [2 * val, 0]
      : [0, 2 * val];
  }

  // Ensure domain includes zero
  extent[0] = (extent as Extent)[0] > 0 ? 0 : extent[0];
  extent[1] = (extent as Extent)[1] < 0 ? 0 : extent[1];

  return extent as Extent;
};

const stepScaleFactors = (step: number): number[] => (step === 1 ? [10, 5, 2, 1] : rangeStep(0.5)(0, 10));

export const computeTickNumber = (range: Extent, tickSpacing: number, minTicks: number = 0) => {
  const length = Math.abs(range[1] - range[0]);
  return Math.max(Math.floor(length / tickSpacing), minTicks);
};

// Computes nice steps (for ticks) given a domain [start, stop] and a
// wanted number of ticks (number of ticks returned might differ
// by a few ticks)
const computeInterval = (range: Extent, domain: Extent, options: FullQuantAxisOptions) => {
  const tickNumber = computeTickNumber(range, options.tickSpacing, options.minTicks);
  const span = domain[1] - domain[0];
  let step = Math.pow(10, Math.floor(Math.log(Math.abs(span) / tickNumber) / Math.LN10)) * (span < 0 ? -1 : 1);

  let scaleFactor: number;
  if (options.end) {
    // If a value has been explicitly set for options.end, there must be a tick at this value
    const validScaleFactors = stepScaleFactors(step).filter(val => (span / (step * val)) % 1 === 0);
    // Choose scale factor which gives a number of ticks as close as possible to tickNumber
    scaleFactor = validScaleFactors.sort(val => Math.abs(span / (val * step) - tickNumber))[0];
  } else {
    const err = (tickNumber / span) * step;
    const errorMapper: Array<[boolean, number]> = [[err <= 0.15, 10], [err <= 0.35, 5], [err <= 0.75, 2]];
    scaleFactor = (errorMapper.find(val => val[0]) || [true, 1])[1];
  }
  step *= scaleFactor;
  return step;
};

const computeTickArray = (datum: InitialComputedDatum, scale: Scale, formatter: Formatter) => {
  const ticks = computeTickValues(datum.tickSteps);
  const labels = computeTickValues(datum.labelSteps);

  return ticks.map(value => ({
    value,
    position: scale(value),
    ...{
      label: labels.includes(value) ? formatter(value) : "",
      class: value === 0 ? "zero" : undefined,
    },
  }));
};

const computeTickSteps = (range: Extent, domain: Extent, options: FullQuantAxisOptions) => {
  const interval = options.tickInterval || computeInterval(range, domain, options);
  return computeSteps(domain, interval, options);
};

const computeLabelSteps = (range: Extent, domain: Extent, options: FullQuantAxisOptions) => {
  const interval = options.labelInterval || options.tickInterval || computeInterval(range, domain, options);
  return computeSteps(domain, interval, options);
};

const computeRuleSteps = (range: Extent, domain: Extent, options: FullQuantAxisOptions) => {
  const interval = options.ruleInterval || options.tickInterval || computeInterval(range, domain, options);
  return computeSteps(domain, interval, options);
};

const computeTickValues = (steps: Steps): number[] => {
  return [...d3Range.apply(d3, steps), steps[1]];
};

const computeSteps = (domain: Extent, interval: number, options: FullQuantAxisOptions) => {
  const computedStart = options.end
    ? (options.end % interval) - (options.end % interval > domain[0] ? interval : 0)
    : 0;
  const start = options.start || computedStart || Math.floor(domain[0] / interval) * interval;
  const end = options.end || Math.ceil((domain[1] - start) / interval) * interval + start;
  return [start, end, interval];
};

const computeRuleTicks = (steps: Steps, options: FullQuantAxisOptions, scale: Scale) => {
  const values = options.showRules ? [...d3Range.apply(d3, steps), steps[1]] : [];
  return values.map(value => ({
    position: scale(value),
    class: value === 0 ? "zero" : "",
  }));
};

const alignAxes = (axes: Record<AxisPosition, InitialComputedDatum>) => {
  if (keys(axes).length === 1) {
    return;
  }

  const axisKeys = keys(axes) as AxisPosition[];
  STEPS_TO_ALIGN.forEach((key: StepsToAlign) => {
    const one = axes[axisKeys[0]][key];
    const two = axes[axisKeys[1]][key];
    alignSteps(one, two);
    axes[axisKeys[0]][key] = one;
    axes[axisKeys[1]][key] = two;
  });
};

const alignSteps = (one: Steps, two: Steps) => {
  const zeroOne = containsZero(one);
  const zeroTwo = containsZero(two);

  if (zeroOne && zeroTwo) {
    const max = [Math.max(zeroOne[0], zeroTwo[0]), Math.max(zeroOne[1], zeroTwo[1])];
    one[0] = one[0] - (max[0] - zeroOne[0]) * one[2];
    one[1] = one[1] + (max[1] - zeroOne[1]) * one[2];
    two[0] = two[0] - (max[0] - zeroTwo[0]) * two[2];
    two[1] = two[1] + (max[1] - zeroTwo[1]) * two[2];
  } else {
    const stepsL = (one[1] - one[0]) / one[2];
    const stepsR = (two[1] - two[0]) / two[2];
    const stepsDiff = stepsL - stepsR;
    if (stepsDiff > 0) {
      two[0] = two[0] - Math.floor(stepsDiff / 2) * two[2];
      two[1] = two[1] + Math.ceil(stepsDiff / 2) * two[2];
    } else if (stepsDiff < 0) {
      one[0] = one[0] + Math.ceil(stepsDiff / 2) * one[2];
      one[1] = one[1] - Math.floor(stepsDiff / 2) * one[2];
    }
  }
};

export const containsZero = (step: Steps) =>
  step[0] <= 0 && step[1] >= 0 ? [Math.abs(step[0] / step[2]), step[1] / step[2]] : undefined;

export default (data: Data, formatter?: Formatter): AxisRecord<QuantAxisComputed> => {
  const initialComputed = (mapValues as WithConvert<LodashMapValues>).convert({ cap: false })(
    (datum: Datum, axis: AxisPosition) => {
      const domain = computeDomain(datum.values, datum.options.start, datum.options.end);
      const fullOptions: FullQuantAxisOptions = {
        ...defaultOptions(datum.options.type, axis),
        ...datum.options,
      };
      return {
        ...datum,
        options: fullOptions,
        domain,
        tickSteps: computeTickSteps(datum.range, domain, fullOptions),
        labelSteps: computeLabelSteps(datum.range, domain, fullOptions),
        ruleSteps: computeRuleSteps(datum.range, domain, fullOptions),
      };
    },
  )(data);

  alignAxes(initialComputed);

  return mapValues(
    (datum: InitialComputedDatum): QuantAxisComputed => {
      const tickValues = computeTickValues(datum.tickSteps);
      const scale = scaleLinear()
        .range(datum.range)
        .domain(d3Extent(tickValues) as Extent);

      return {
        scale,
        length: Math.abs(datum.range[1] - datum.range[0]),
        range: datum.range,
        formatter: formatter || defaultNumberFormatter,
        ticks: computeTickArray(datum, scale, formatter || defaultNumberFormatter),
        rules: computeRuleTicks(datum.ruleSteps, datum.options, scale),
        options: datum.options,
      };
    },
  )(initialComputed);
};
