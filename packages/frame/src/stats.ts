import { IterableFrame, ColumnCursor } from "./types";

interface StatsCacheItem {
  max?: number;
  unique?: string[];
}

const statsCache = new WeakMap<IterableFrame<string>, Record<number, StatsCacheItem>>();

const getStatsCacheItem = <Name extends string>(
  frame: IterableFrame<Name>,
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

export const maxValue = <Name extends string>(
  frame: IterableFrame<Name>,
  column: ColumnCursor<Name>,
  categorical?: ColumnCursor<Name>
) => {
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
    if (categorical) {
      const ticks = uniqueValues(frame, categorical);
      ticks.forEach(tick => {
        let total = 0;
        frame.mapRows(row => {
          if (categorical(row) === tick) {
            total += column(row);
          }
          return total;
        });
        max = max === undefined ? total : Math.max(max, total);
      });
    } else {
      frame.mapRows(row => {
        max = max === undefined ? column(row) : Math.max(max, column(row));
      });
    }
    cacheItem.max = max!;
  }
  return cacheItem.max!;
};

export const uniqueValues = <Name extends string>(
  frame: IterableFrame<Name>,
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

export const uniqueValueCombinations = <Name extends string>(
  frame: IterableFrame<Name>,
  columns: Array<ColumnCursor<Name>>,
): Array<string[]> => {
  const columnValues = columns.map(c => uniqueValues(frame, c))

  const combineValues = (i: number, values: string[]): Array<string[]> => {
    return i === columns.length - 1
      ? columnValues[i].map(val => [...values, val])
      : columnValues[i].reduce((arr: Array<string[]>, val) => {
          return [...arr, ...combineValues(i + 1, [...values, val])]
        }, [])
  }

  return combineValues(0, [])
}

