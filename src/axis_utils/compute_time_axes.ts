import { scaleTime, ScaleTime } from "d3-scale"
import { compact, forEach, get, groupBy, isEmpty, keys, last, mapValues, partition, times, uniqueId } from "lodash/fp"
import { AxisPosition, BarsInfo, ComputedSeries, Extent, InputData, InputDatum, Rule, TimeAxisOptions, TimeIntervals, TimeAxisComputed } from "./typings"
import { timeFormat } from "d3-time-format"
import { computeBarPositions } from "./discrete_axis_utils"
import * as Moment from "moment"
import { extendMoment } from "moment-range"
import { timeMonday } from "d3-time";
const moment: any = extendMoment(Moment)
import defaultOptions from "./axis_config"

interface Config {
  innerBarSpacing: number;
  outerBarSpacing: number;
  minBarWidth: number;
}

const defaultConfig = {
  innerBarSpacing: 2,
  outerBarSpacing: 10,
  minBarWidth: 3,
}

type Datum = InputDatum<Date, TimeAxisOptions>;

type Scale = ScaleTime<number, number>;

// @TODO - add in more options
// Have removed "now", and any formatting to account for change in month/year
export const tickFormatter = (interval: TimeIntervals) => {
  switch (interval) {
    case "hour":
      return timeFormat("%b %d %H:00")
    case "day":
      return timeFormat("%b %d")
    case "week":
      return timeFormat("W%W")
    case "month":
      return timeFormat("%b %y")
    case "quarter":
      return (d: Date): string => timeFormat(`Q${Math.floor((d.getMonth() + 3) / 3)} %Y`)(d)
    case "year":
      return timeFormat("%Y")
    default:
      throw new Error(`Interval of length ${interval} is not supported.`)
  }
}

const computeTickInfo = (datum: Datum, computedSeries: ComputedSeries, config: Config) => {
  const barSeries = computedSeries.barSeries

  // Ticks only have widths if bars are being rendered
  if (isEmpty(barSeries)) {
    return {
      tickWidth: 0,
      range: datum.range
    }
  }

  // Compute default tick width based on available space
  const length = Math.abs(datum.range[1] - datum.range[0])
  const nTicks = datum.values.length
  const defaultTickWidth = (length - config.outerBarSpacing * datum.values.length) / nTicks

  // Identify (groups of stacked) bars that need to be placed side-by-side in each tick,
  // and compute widths for each.
  const stacks = groupBy((s: BarsInfo) => s.stackIndex || uniqueId("stackIndex"))(barSeries)

  const partitionedStacks = partition(
    (stack: BarsInfo[]) => compact(stack.map(get("barWidth"))).length > 0
  )(stacks)

  // Compute total inner padding between bars of same tick
  const innerPaddingTotal = config.innerBarSpacing * (keys(stacks).length - 1)

  // Split stacks of bars into those with assigned widths, and those without
  const fixedWidthStacks: BarsInfo[][] = partitionedStacks[0]
  const variableWidthStacks: BarsInfo[][] = partitionedStacks[1]

  // Total width needed for stacks of pre-defined width
  const requiredWidthForFixedWidthStacks = fixedWidthStacks.reduce<number>((sum, stack) =>
    sum + stack[0].barWidth
  , 0)

  // Width of stacks without pre-defined width
  const variableBarWidth = variableWidthStacks.length
    ? Math.max(
      config.minBarWidth,
      (defaultTickWidth - innerPaddingTotal - requiredWidthForFixedWidthStacks) / variableWidthStacks.length
    )
    : 0

  // Required tick width
  const tickWidth = requiredWidthForFixedWidthStacks + innerPaddingTotal + variableBarWidth * variableWidthStacks.length
  const tickWidthWithPadding = Math.max(tickWidth, defaultTickWidth) + config.outerBarSpacing

  // Adjust range to account for tick widths
  const rangeTop = Math.min(...datum.range) + tickWidthWithPadding * (nTicks - 0.5);
  const rangeBottom = Math.min(...datum.range) + tickWidthWithPadding / 2;

  const range: Extent = datum.range[0] < datum.range[1]
    ? [rangeBottom, rangeTop]
    : [rangeTop, rangeBottom]

  return {
    tickWidth: tickWidthWithPadding,
    range,
    ...computeBarPositions(variableBarWidth, tickWidth, config, computedSeries)
  }
}

const computeTickArray = (datum: Datum, scale: Scale, formatter: (value: Date) => string) => {
  let ticksToShow: Date[];
  const width = Math.abs(datum.range[1] - datum.range[0])
  const tickNumber = Math.min(datum.values.length, Math.max(Math.floor(width / datum.options.tickSpacing), datum.options.minTicks))
  if (datum.options.interval === "week") {
    const mondayTicks = scale.ticks(timeMonday)
    ticksToShow = mondayTicks.filter((tick: Date, i: number) => i % 6 === 0)
  } else {
    const ticks = scale.ticks(tickNumber || 1)
    ticksToShow = ticks.length > datum.values.length ? datum.values : ticks;
  }

  return datum.values.map(value => ({
    value,
    hideTick: !ticksToShow.map(tick => tick.toString()).includes(value.toString()),
    position: scale(value),
    label: formatter(value)
  }))
}

const computeRuleTicks = (datum: Datum, scale: Scale, tickWidth: number): Rule[] =>
  datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - tickWidth / 2 })).slice(tickWidth ? 1 : 0)
    : []

const alignAxes = (axes: InputData<Date, TimeAxisOptions>) => {
  forEach((axis: Datum) => axis.values = ticksInDomain(axis))(axes)

  const axisKeys = keys(axes);
  if (axisKeys.length === 1) {
    return
  }

  const intervalOne = axes[axisKeys[0]].options.interval
  const intervalTwo = axes[axisKeys[1]].options.interval

  if (intervalOne !== intervalTwo) {
    throw new Error("Time axes must have the same interval")
  }

  const ticksOne = ticksInDomain(axes[axisKeys[0]])
  const ticksTwo = ticksInDomain(axes[axisKeys[1]])

  if (ticksOne.length < ticksTwo.length) {
    times(() => {
      ticksOne.push(
        moment.default(last(ticksOne))
          .add(1, intervalOne)
          .toDate(),
      )
    })(ticksTwo.length - ticksOne.length)
  } else {
    times(() => {
      ticksTwo.push(
        moment.default(last(ticksTwo))
          .add(1, intervalTwo)
          .toDate(),
      )
    })(ticksOne.length - ticksTwo.length)
  }

  axes[axisKeys[0]].values = ticksOne
  axes[axisKeys[1]].values = ticksTwo
}

const ticksInDomain = (datum: Datum): Date[] =>
  Array.from(
    moment
      .range(datum.options.start, datum.options.end)
      .by(datum.options.interval)
  ).map((d: any) => d.toDate())

export default (data: InputData<Date, TimeAxisOptions>, computedSeries: ComputedSeries, config?: Config): Record<AxisPosition, TimeAxisComputed> => {
  keys(data).forEach((axis: AxisPosition) => {
    data[axis].options = {
      ...defaultOptions(data[axis].options.type, axis),
      ...data[axis].options
    } as TimeAxisOptions
  })

  alignAxes(data)

  return mapValues((datum: Datum) => {
    const tickInfo = computeTickInfo(datum, computedSeries, { ...defaultConfig, ...config })
    const scale = scaleTime().range(tickInfo.range).domain([datum.values[0], last(datum.values)])
    const formatter = tickFormatter(datum.options.interval)

    return {
      ...tickInfo,
      scale,
      formatter,
      length: Math.abs(datum.range[1] - datum.range[0]),
      ticks: computeTickArray(datum, scale, formatter),
      rules: computeRuleTicks(datum, scale, tickInfo.tickWidth),
      options: datum.options
    }
  })(data)
}
