import { scaleTime, ScaleTime } from "d3-scale"
import { compact, get, groupBy, isEmpty, keys, last, mapValues, partition, times, uniqueId } from "lodash/fp"
import { AxisComputed, AxisPosition, BarsInfo, ComputedSeries, Extent, InputData, InputDatum, Rule, TimeAxisOptions, TimeIntervals } from "./typings"
import { timeFormat } from "d3-time-format"
import { computeBarPositions } from "./discrete_axis_utils"
import * as Moment from "moment"
import { extendMoment } from "moment-range"
const moment: any = extendMoment(Moment)

interface Config {
  innerBarSpacing: number;
  outerBarSpacing: number;
  minBarWidth: number
}

// @TODO - add in more options
// Have removed "now", and any formatting to account for change in month/year
const tickFormatter = (interval: TimeIntervals) => {
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

const computeTickInfo = (datum: InputDatum<Date, TimeAxisOptions>, config: Config, computedSeries: ComputedSeries) => {
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
  const variableBarWidth = Math.max(
    config.minBarWidth,
    (defaultTickWidth - innerPaddingTotal - requiredWidthForFixedWidthStacks) / variableWidthStacks.length
  )

  // Required tick width
  const tickWidth = (requiredWidthForFixedWidthStacks + innerPaddingTotal + variableBarWidth * variableWidthStacks.length)
  const tickWidthWithPadding = tickWidth + config.outerBarSpacing

  const range: Extent = [
    datum.range[0] + tickWidthWithPadding / 2,
    datum.range[0] + tickWidthWithPadding * (nTicks - 0.5)
  ]

  return {
    tickWidth: tickWidthWithPadding,
    range,
    ...computeBarPositions(variableBarWidth, tickWidth, config, computedSeries)
  }
}

const computeTickArray = (values: Date[], scale: ScaleTime<number, number>, formatter: (value: Date) => string) =>
  values.map(tickVal => ({
    position: scale(tickVal),
    label: formatter(tickVal)
  }))

const computeRuleTicks = (datum: InputDatum<Date, TimeAxisOptions>, scale: ScaleTime<number, number>, tickWidth: number): Rule[] =>
  datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - tickWidth / 2 })).slice(1)
    : []

export default (data: InputData<Date, TimeAxisOptions>, config: Config, computedSeries: ComputedSeries): Record<AxisPosition, AxisComputed<ScaleTime<number, number>, string>> => {
  return mapValues((datum: InputDatum<Date, TimeAxisOptions>) => {
    const tickInfo = computeTickInfo(datum, config, computedSeries)
    const scale = scaleTime().range(tickInfo.range).domain([datum.values[0], last(datum.values)])

    return {
      ...tickInfo,
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      ticks: computeTickArray(datum.values, scale, tickFormatter(datum.options.interval)),
      rules: computeRuleTicks(datum, scale, tickInfo.tickWidth),
    }
  })(data)
}
