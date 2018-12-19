import { compact, get, groupBy, identity, keys, partition, pickBy, pluck, sortBy, uniq, uniqueId } from "lodash/fp";
import { BarSeries, BarSeriesInfo, DiscreteInputDatum, Extent, Rule } from "./typings";

interface Config {
  outerBarSpacing: number;
  innerBarSpacing: number;
  minBarWidth: number;
}

export const computeBarPositions = (range: Extent, nTicks: number, config: Config, barSeries: BarSeriesInfo) => {
  // Compute default tick width based on available space, disregarding bar widths and padding
  const defaultTickWidth = computeTickWidth(range, nTicks, true);

  // Identify (groups of stacked) bars that need to be placed side-by-side in each tick,
  // and partition by whether they have explicitly defined widths.
  const stacks = groupBy((s: BarSeries) => s.stackIndex || uniqueId("stackIndex"))(barSeries);

  const partitionedStacks = partition((stack: BarSeries[]) => compact(stack.map(get("barWidth"))).length > 0)(stacks);

  const fixedWidthStacks: BarSeries[][] = partitionedStacks[0];
  const variableWidthStacks: BarSeries[][] = partitionedStacks[1];

  // Compute total padding needed per tick - outerPadding + innerPadding between ticks
  const totalPadding = config.outerBarSpacing + config.innerBarSpacing * (keys(stacks).length - 1);

  // Total width needed for stacks of pre-defined width
  const requiredWidthForFixedWidthStacks = fixedWidthStacks.reduce<number>((sum, stack) => {
    const seriesInStack = stack[0];
    return sum + ((seriesInStack && seriesInStack.barWidth) || 0);
  }, 0);

  const defaultBarWidth = variableWidthStacks.length
    ? Math.max(
        config.minBarWidth,
        (defaultTickWidth - totalPadding - requiredWidthForFixedWidthStacks) / variableWidthStacks.length,
      )
    : 0;

  const tickWidth = totalPadding + requiredWidthForFixedWidthStacks + defaultBarWidth * variableWidthStacks.length;

  const indices = sortBy(identity)(uniq(pluck("index")(barSeries))) as number[];
  let offset = (config.outerBarSpacing - tickWidth) / 2;

  const lookup = indices.reduce<Record<string, { width: number; offset: number }>>((memo, index) => {
    const seriesAtIndex = keys(pickBy((series: BarSeries) => series.index === index)(barSeries)) as string[];
    const width = barSeries[seriesAtIndex[0]].barWidth || defaultBarWidth;
    seriesAtIndex.forEach((series: string) => {
      memo[series] = { width, offset };
    });
    offset = offset + width + config.innerBarSpacing;
    return memo;
  }, {});

  return {
    width: (seriesId: string) => lookup[seriesId].width,
    offset: (seriesId: string) => lookup[seriesId].offset,
  };
};

export const computeTickWidth = (range: Extent, nTicks: number, hasBars?: boolean) =>
  hasBars ? Math.abs(range[1] - range[0]) / nTicks : 0;

export const computeRuleTicks = (datum: DiscreteInputDatum, scale: any): Rule[] => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, datum.hasBars);
  const sliceStartIndex = tickWidth && datum.range[1] >= datum.range[0] ? 1 : 0;
  const sliceEndIndex = tickWidth && datum.range[1] < datum.range[0] ? datum.values.length - 1 : datum.values.length;

  return datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - tickWidth / 2 })).slice(sliceStartIndex, sliceEndIndex)
    : [];
};
