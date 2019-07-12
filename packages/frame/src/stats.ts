import { IteratableFrame, ColumnCursor } from "./types";

interface StatsCacheItem {
  max?: number;
  unique?: string[];
}

const statsCache = new WeakMap<IteratableFrame<string>, Record<number, StatsCacheItem>>();

const getStatsCacheItem = <Name extends string>(
  frame: IteratableFrame<Name>,
  column: ColumnCursor<Name>,
): StatsCacheItem => {
  if (!statsCache.has(frame)) {
    statsCache.set(frame, {});
  }
  const cacheEntry = statsCache.get(frame)!;
  if (!cacheEntry[column.index]) {
    cacheEntry[column.index] = {};
  }
  return cacheEntry[column.index];
};

export const maxValue = <Name extends string>(frame: IteratableFrame<Name>, column: ColumnCursor<Name>): number => {
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.max === undefined) {
    // https://github.com/contiamo/operational-visualizations/issues/72
    // if (process.env.NODE_ENV === "development") {
    //   if (frame.schema[column.index].type !== "number") {
    //     console.warn(`Trying to get max value of none-numeric column ${column.name}`);
    //   }
    // }
    // if (frame.length() === 0) {
    //   throw new Error("Can't get max value of empty Frame")
    // }
    let max: number | undefined = undefined;
    frame.mapRows(row => {
      max = max === undefined ? row[column.index] : Math.max(max, row[column.index]);
    });
    cacheItem.max = max!;
  }
  return cacheItem.max!;
};

export const uniqueValues = <Name extends string>(
  frame: IteratableFrame<Name>,
  column: ColumnCursor<Name>,
): string[] => {
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.unique === undefined) {
    const unique = new Set<string>();
    frame.mapRows(row => {
      unique.add(row[column.index]);
    });
    cacheItem.unique = [...unique];
  }
  return cacheItem.unique!;
};
