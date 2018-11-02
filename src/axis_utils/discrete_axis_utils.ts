import { identity, keys, pickBy, sortBy, uniq, values } from "lodash/fp"
import { BaseConfig } from "./typings";

export const computeBarPositions = (defaultBarWidth: number, tickWidth: number, config: BaseConfig, computedSeries: any) => {
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
