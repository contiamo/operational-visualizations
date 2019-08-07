import { IterableFrame, RowCursor } from "@operational/frame";
import theme from "./theme";
import { joinArrayAsString } from "./utils";

const colorPalette = theme.palettes.qualitative.operational;

type ColorCacheItem = Record<string, string>

const colorCache = new WeakMap<IterableFrame<string>, Record<string, ColorCacheItem>>();

const getColorCacheItem = (frame: IterableFrame<string>, key: string): ColorCacheItem => {
  if (!colorCache.has(frame)) {
    colorCache.set(frame, {})
  }
  const cacheEntry = colorCache.get(frame)!;
  if (!cacheEntry[key]) {
    cacheEntry[key] = {};
  }
  return cacheEntry[key];
}

export const getColorScale = (frame: IterableFrame<string>, colorBy: Array<string>) => {
  const colorByKey = joinArrayAsString(colorBy)
  let cacheItem = getColorCacheItem(frame, colorByKey);
  const colorByCursors = (colorBy || []).map(x => frame.getCursor(x));
  const uniqueValues = frame.uniqueValues(colorBy || []).map(joinArrayAsString);

  if (Object.entries(cacheItem).length === 0) {
    if (colorBy.length === 0 || uniqueValues.length === 1) {
      return () => colorPalette[0];
    }
    uniqueValues.forEach(value => {
        const index = uniqueValues.indexOf(value);
        cacheItem[value] = colorPalette[index % colorPalette.length]
    })
  }

  return (row: RowCursor) => {
    const valuesString = joinArrayAsString(colorByCursors.map(cursor => cursor(row)));
    if (!cacheItem[valuesString]) {
      const index = uniqueValues.indexOf(valuesString);
      cacheItem[valuesString] = colorPalette[index % colorPalette.length]
    }
    return cacheItem[valuesString]
  };
};
