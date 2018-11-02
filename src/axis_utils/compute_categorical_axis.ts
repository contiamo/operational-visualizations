import { scaleBand, ScaleBand } from "d3-scale"
import { compact, get, groupBy, isEmpty, keys, mapValues, partition, uniqueId } from "lodash/fp"
import { AxisComputed, AxisPosition, BarsInfo, CategoricalAxisOptions, ComputedSeries, Extent, InputData, InputDatum, Tick, Rule } from "./typings"
import { computeBarPositions } from "./discrete_axis_utils"

interface Config {
  innerBarSpacingCategorical: number;
  innerBarSpacing: number;
  minBarWidth: number
}

const computeTickInfo = (datum: InputDatum<string, CategoricalAxisOptions>, config: Config, computedSeries: ComputedSeries) => {
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
  const defaultTickWidthWithoutOuterPadding = (length / (nTicks + config.innerBarSpacingCategorical * (nTicks + 1)))

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
    (defaultTickWidthWithoutOuterPadding - innerPaddingTotal - requiredWidthForFixedWidthStacks) / variableWidthStacks.length
  )

  // Required tick width
  const tickWidth = (requiredWidthForFixedWidthStacks + innerPaddingTotal + variableBarWidth * variableWidthStacks.length)
  const tickWidthWithPadding = tickWidth * (1 + config.innerBarSpacingCategorical)

  const range: Extent = [
    datum.range[0] + tickWidth / 2,
    datum.range[0] + tickWidthWithPadding * nTicks + tickWidth * config.innerBarSpacingCategorical + tickWidth / 2
  ]

  return {
    tickWidth: tickWidthWithPadding,
    range,
    ...computeBarPositions(variableBarWidth, tickWidth, config, computedSeries)
  }
}

const computeTickArray = (values: string[], scale: ScaleBand<string>): Tick[] =>
  values.map(tickVal => ({
    position: scale(tickVal),
    label: tickVal
  }))

const computeRuleTicks = (datum: InputDatum<string, CategoricalAxisOptions>, scale: ScaleBand<string>): Rule[] =>
  datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - scale.step() / 2 })).slice(1)
    : []

export default (data: InputData<string, CategoricalAxisOptions>, config: Config, computedSeries: ComputedSeries): Record<AxisPosition, AxisComputed<ScaleBand<string>, string>> => {
  if (keys(data).length > 1) {
    throw new Error("Categorical axes cannot be aligned.")
  }

  return mapValues((datum: InputDatum<string, CategoricalAxisOptions>) => {
    const tickInfo = computeTickInfo(datum, config, computedSeries)
    const scale = scaleBand().range(tickInfo.range).domain(datum.values).padding(config.innerBarSpacingCategorical)
    return {
      ...tickInfo,
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      ticks: computeTickArray(datum.values, scale),
      rules: computeRuleTicks(datum, scale),
    }
  })(data)
}
