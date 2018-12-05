import { identity, keys, pickBy, pluck, sortBy, uniq } from "lodash/fp"
import { BarSeriesInfo, BarSeries, Extent, DiscreteInputDatum, Rule } from "./typings";
import { ChartConfig } from "../Chart/typings";

export const computeBarPositions = (defaultBarWidth: number, tickWidth: number, config: Readonly<ChartConfig>, barSeries: BarSeriesInfo) => {
  const indices = sortBy(identity)(uniq(pluck("index")(barSeries))) as number[]
  let offset = (config.outerBarSpacing - tickWidth) / 2

  const lookup = indices.reduce<Record<string, { width: number, offset: number }>>((memo, index) => {
    const seriesAtIndex = keys(pickBy((series: BarSeries) => series.index === index)(barSeries)) as string[]
    const width = barSeries[seriesAtIndex[0]].barWidth || defaultBarWidth
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

export const computeTickWidth = (range: Extent, nTicks: number, hasBars: boolean) =>
  hasBars ? Math.abs(range[1] - range[0]) / nTicks : 0

export const computeRuleTicks = (datum: DiscreteInputDatum, scale: any): Rule[] => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, datum.hasBars)
  return datum.options.showRules
    ? datum.values.map(value => ({ position: scale(value) - tickWidth / 2 })).slice(tickWidth ? 1 : 0)
    : []
}
