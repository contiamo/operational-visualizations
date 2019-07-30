import { IterableFrame, ColumnCursor, RowCursor } from "./types";
import { DimensionValue } from "./PivotFrame";
import { getData } from "./secret";
import { DataFrame } from "./DataFrame";
import { FragmentFrame } from "./FragmentFrame";

interface StatsCacheItem {
  max?: number;
  total?: number;
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

// rename to max
export const maxValue = <Name extends string>(frame: IterableFrame<Name>, column: ColumnCursor<Name>): number => {
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

export const total = <Name extends string>(frame: IterableFrame<Name>, column: ColumnCursor<Name>): number => {
  const cacheItem = getStatsCacheItem(frame, column);
  if (cacheItem.total === undefined) {
    // https://github.com/contiamo/operational-visualizations/issues/72
    let total: number | undefined = undefined;
    frame.mapRows(row => {
      total = total === undefined ? row[column.index] : total + row[column.index];
    });
    cacheItem.total = total!;
  }
  return cacheItem.total!;
};

// rename to unique
export const uniqueValues = <Name extends string>(frame: IterableFrame<Name>, column: ColumnCursor<Name>): string[] => {
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

export const buildIndex = <Name extends string>(
  frame: DataFrame<Name> | FragmentFrame<Name>,
  columns: Array<ColumnCursor<Name>>,
) => {
  const [, data, sliceIndex] = frame[getData]();

  const last = columns.length - 1;
  const pivotBy = columns.map(column => column.index);
  /**
   * tree structure implemented as nested records
   * {[valueFromRowA]: {[valueFromRowB]: {...: [<numbers of rows in this.data with valueFromRowA, valueFromRowB ...>] }}}
   * It corresponds to `CREATE INDEX treeIndex ON table (rowA, rowB, ...);` - in first level we will have unique values for [rowA],
   * in second level we will have unique values for [rowA, rowB] etc.
   * In the end there is a list of indexes of rows from original data.
   * If we need to find what rows (from the `this.data`) correspond to [valueFromRowA, valueFromRowB ...]
   * we can do following treeIndex[valueFromRowA][valueFromRowB][...] and we will get array on indexes
   */
  const treeIndex = {} as Record<DimensionValue, any>;
  /**
   * matrix structure implemented as array of arrays
   * [[valueFromRowA, valueFromRowB, ...]]
   * It corresponds to `SELECT rowA, rowB, ... FROM table GROUP BY rowA, rowB, ...`
   */
  const uniqueValues: DimensionValue[][] = [];
  /**
   * matrix structure implemented as array of arrays
   * [[<numbers of rows in this.data with valueFromRowA, valueFromRowB ...>]]
   * first row in uniqueValues corresponds to first row in uniqueValues etc.
   */
  const index: number[][] = [];

  const rowIterator = (dataRow: RowCursor, rowNumber: number) => {
    const rowHeader: DimensionValue[] = [];
    let previousRow: Record<DimensionValue, any> = treeIndex;

    pivotBy.forEach((dimensionIndex, i) => {
      const dimensionValue = dataRow[dimensionIndex];
      rowHeader.push(dimensionValue);

      if (previousRow[dimensionValue] === undefined) {
        if (i === last) {
          uniqueValues.push(rowHeader);
          index[uniqueValues.length - 1] = previousRow[dimensionValue] = [];
        } else {
          previousRow[dimensionValue] = {};
        }
      }
      if (i === last) {
        previousRow[dimensionValue].push(rowNumber);
      }
      previousRow = previousRow[dimensionValue];
    });
  };

  if (sliceIndex) {
    sliceIndex.forEach(rowNumber => rowIterator(data[rowNumber], rowNumber));
  } else {
    data.forEach(rowIterator);
  }

  return { uniqueValues, index };
};
