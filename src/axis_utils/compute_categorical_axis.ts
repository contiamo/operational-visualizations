import { scaleBand, ScaleBand } from "d3-scale"
import { compact, get, groupBy, identity, isEmpty, keys, mapValues, partition, pickBy, sortBy, uniq, uniqueId, values } from "lodash/fp"
import { AxisComputed, AxisPosition, BarsInfo, CategoricalAxisOptions, Tick, Rule } from "./typings"

interface InputDatum {
  range: [number, number];
  values: string[];
  options: CategoricalAxisOptions
}

type InputData = Record<AxisPosition, InputDatum>

interface Config {
  innerBarSpacingCategorical: number;
  innerBarSpacing: number;
  minBarWidth: number
}

interface ComputedSeries {
  barSeries: Record<string, BarsInfo>,
  barIndices: Record<string, number>
}

const computeTickInfo = (datum: InputDatum, config: Config, computedSeries: ComputedSeries) => {
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
    (stack: BarsInfo[]) =>
      compact(stack.map(get("barWidth"))).length > 0
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
  const range: [number, number] = [
    datum.range[0] + tickWidth / 2,
    datum.range[0] + tickWidthWithPadding * nTicks + tickWidth * config.innerBarSpacingCategorical + tickWidth / 2
  ]

  return {
    tickWidth: tickWidthWithPadding,
    range,
    ...computeBarPositions(variableBarWidth, tickWidth, config, computedSeries)
  }
}

const computeBarPositions = (defaultBarWidth: number, tickWidth: number, config: Config, computedSeries: any) => {
  const indices = sortBy(identity)(uniq(values(computedSeries.barIndices)))
  let offset = -tickWidth / 2

  const lookup = indices.reduce<Record<string, { width: number, offset: number }>>((memo, index) => {
    const seriesAtIndex = keys(pickBy((d: number) => d === index)(computedSeries.barIndices))
    const width = computedSeries.barSeries[seriesAtIndex[0]].barWidth || defaultBarWidth
    seriesAtIndex.forEach((series: string) => {
      memo[series] = { width, offset }
    })
    offset = offset + width + config.innerBarSpacing
    return memo
  }, {})

  return {
    width: (seriesId: string) => lookup[seriesId].width,
    offset: (seriesId: string) => lookup[seriesId].offset
  }
}

const computeTickArray = (values: string[]): Tick<string>[] =>
  values.map((tickVal: string) => ({
    value: tickVal,
    label: tickVal
  }))

const computeRuleTicks = (datum: InputDatum, scale: ScaleBand<string>): Rule[] =>
  datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - scale.step() / 2 })).slice(1)
    : []

export default (data: InputData, config: Config, computedSeries: ComputedSeries): Record<AxisPosition, AxisComputed<ScaleBand<string>, string>> => {
  if (keys(data).length > 1) {
    throw new Error("Categorical axes cannot be aligned.")
  }

  return mapValues((datum: InputDatum) => {
    const tickInfo = computeTickInfo(datum, config, computedSeries)
    const scale = scaleBand().range(tickInfo.range).domain(datum.values).padding(config.innerBarSpacingCategorical)
    return {
      ...tickInfo,
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      ticks: computeTickArray(datum.values),
      rules: computeRuleTicks(datum, scale),
    }
  })(data)
}
