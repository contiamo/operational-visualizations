import { IterableFrame, ColumnCursor, DimensionValue } from "./types";
import { GroupFrame, isGroupFrame } from "./GroupFrame";

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
    if (isGroupFrame(frame)) {
      // we use sum as aggregation function, but we can use average or mean
      // we can pass information about which aggregation to use inside GroupFrame
      const aggregation = total;
      frame.map(row => {
        const value = aggregation(row, column);
        if (value != null) {
          max = max === undefined ? value : Math.max(max, value);
        }
        // to make linter happy, shall we add reduce and use it instead of map?
        return null;
      });
    } else {
      frame.mapRows(row => {
        const value = row[column.index];
        if (value != null) {
          max = max === undefined ? value : Math.max(max, value);
        }
      });
    }
    cacheItem.max = max!;
  }
  return cacheItem.max!;
};

export const total = <Name extends string>(
  frame: IterableFrame<Name> | GroupFrame<Name>,
  column: ColumnCursor<Name>,
): number => {
  if (isGroupFrame(frame)) {
    frame = frame.ungroup();
  }
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.total === undefined) {
    // https://github.com/contiamo/operational-visualizations/issues/72
    let total: number | undefined = undefined;
    frame.mapRows(row => {
      const value = row[column.index];
      if (value) {
        total = total === undefined ? parseFloat(value) : total + parseFloat(value);
      }
    });
    cacheItem.total = total!;
  }
  return cacheItem.total!;
};

// rename to unique
export const uniqueValues = <Name extends string>(
  frame: IterableFrame<Name> | GroupFrame<Name>,
  column: ColumnCursor<Name>,
): DimensionValue[] => {
  if (isGroupFrame(frame)) {
    frame = frame.ungroup();
  }
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
