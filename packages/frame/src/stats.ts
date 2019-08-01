import { IterableFrame, ColumnCursor, DimensionValue } from "./types";
import { GroupFrame } from "./GroupFrame";

interface StatsCacheItem {
  max?: number;
  total?: number;
  unique?: string[];
}

const statsCache = new WeakMap<IterableFrame<string> | GroupFrame<string>, Record<number, StatsCacheItem>>();

const getStatsCacheItem = <Name extends string>(
  frame: IterableFrame<Name> | GroupFrame<Name>,
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

// rename to max
export const maxValue = <Name extends string>(
  frame: IterableFrame<Name> | GroupFrame<Name>,
  column: ColumnCursor<Name>,
): number => {
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
    if (frame instanceof GroupFrame) {
      // we use sum as aggregation function, but we can use average or mean
      // we can pass information about which aggregation to use inside GroupFrame
      const aggregation = total;
      frame.map(row => {
        max = max === undefined ? aggregation(row, column) : Math.max(max, aggregation(row, column));
      });
    } else {
      frame.mapRows(row => {
        if (row[column.index] != null) {
          max = max === undefined ? row[column.index] : Math.max(max, row[column.index]);
        }
      });
    }
    cacheItem.max = max!;
  }
  return cacheItem.max!;
};

export const total = <Name extends string>(frame: IterableFrame<Name>, column: ColumnCursor<Name>): number => {
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.total === undefined) {
    // https://github.com/contiamo/operational-visualizations/issues/72
    let total: number | undefined = undefined;
    frame.mapRows(row => {
      if (row[column.index] != null) {
        total = total === undefined ? parseFloat(row[column.index]) : total + parseFloat(row[column.index]);
      }
    });
    cacheItem.total = total!;
  }
  return cacheItem.total!;
};

// rename to unique
export const uniqueValues = <Name extends string>(
  frame: IterableFrame<Name>,
  column: ColumnCursor<Name>,
): DimensionValue[] => {
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.unique === undefined) {
    const unique = new Set<string>();
    frame.mapRows(row => {
      if (row[column.index] != null) {
        unique.add(row[column.index]);
      }
    });
    cacheItem.unique = [...unique];
  }
  return cacheItem.unique!;
};
