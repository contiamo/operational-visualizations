import { IterableFrame, ColumnCursor, RawRow } from "./types";
import { stackRowBy } from "./utils";

interface StatsCacheItem {
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
  let value: (row: any[]) => number;
  if (categorical) {
    const stackRow = stackRowBy(categorical, column);
    value = (row: RawRow) => stackRow(row) + column(row);
  } else {
    value = column;
  }
  frame.mapRows(row => {
    max = max === undefined ? value(row) : Math.max(max, value(row))
  })

  return max!
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

