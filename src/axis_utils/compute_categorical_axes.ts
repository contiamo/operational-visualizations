import { scaleBand, ScaleBand } from "d3-scale"
import { compact, get, groupBy, isEmpty, keys, mapValues, partition, uniqueId } from "lodash/fp"
import { AxisPosition, BarsInfo, CategoricalAxisOptions, ComputedSeries, Extent, InputData, InputDatum, Rule, CategoricalAxisComputed, Tick } from "./typings"
import { computeBarPositions } from "./discrete_axis_utils"

interface Config {
  innerBarSpacingCategorical: number;
  innerBarSpacing: number;
  minBarWidth: number
}

const defaultConfig = {
  innerBarSpacingCategorical: 0.2,
  innerBarSpacing: 2,
  minBarWidth: 3
}

type Datum = InputDatum<string, CategoricalAxisOptions>;

type Scale = ScaleBand<string>;

const computeTickInfo = (datum: Datum, config: Config, computedSeries: ComputedSeries) => {
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
  const variableBarWidth = variableWidthStacks.length
    ? Math.max(
      config.minBarWidth,
      (defaultTickWidthWithoutOuterPadding - innerPaddingTotal - requiredWidthForFixedWidthStacks) / variableWidthStacks.length
    )
    : 0

  // Required tick width
  const tickWidth = requiredWidthForFixedWidthStacks + innerPaddingTotal + variableBarWidth * variableWidthStacks.length
  const tickWidthWithPadding = Math.max(tickWidth, defaultTickWidthWithoutOuterPadding) * (1 + config.innerBarSpacingCategorical)

  // Adjust range to account for tick widths
  const rangeTop = Math.min(...datum.range) + tickWidthWithPadding * nTicks + tickWidth * config.innerBarSpacingCategorical + tickWidth / 2;
  const rangeBottom = Math.min(...datum.range) + tickWidth / 2;

  const range: Extent = datum.range[0] < datum.range[1]
    ? [rangeBottom, rangeTop]
    : [rangeTop, rangeBottom]

  return {
    tickWidth: tickWidthWithPadding,
    range,
    ...computeBarPositions(variableBarWidth, tickWidth, config, computedSeries)
  }
}

const computeTickArray = (values: string[], scale: Scale): Tick<string>[] =>
  values.map(value => ({
    value,
    position: scale(value),
    label: value
  }))

const computeRuleTicks = (datum: Datum, scale: Scale): Rule[] =>
  datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - scale.step() / 2 })).slice(1)
    : []

export default (data: InputData<string, CategoricalAxisOptions>, computedSeries: ComputedSeries, config?: Config): Record<AxisPosition, CategoricalAxisComputed> => {
  if (keys(data).length > 1) {
    throw new Error("Categorical axes cannot be aligned.")
  }

  const fullConfig = { ...defaultConfig, ...config };

  return mapValues((datum: Datum) => {
    const tickInfo = computeTickInfo(datum, fullConfig, computedSeries)
    const scale = scaleBand().range(tickInfo.range).domain(datum.values).padding(fullConfig.innerBarSpacingCategorical)

    return {
      ...tickInfo,
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      ticks: computeTickArray(datum.values, scale),
      rules: computeRuleTicks(datum, scale),
      options: datum.options
    }
  })(data)
}
