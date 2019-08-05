import { DataFrame } from "./DataFrame";
import { FragmentFrame } from "./FragmentFrame";
import { ColumnCursor, RowCursor, DimensionValue } from "./types";
import { getData } from "./secret";

export const buildIndex = <Name extends string>(
  frame: DataFrame<Name> | FragmentFrame<Name>,
  columns: Array<ColumnCursor<Name>>,
) => {
  const lastColumnNumber = columns.length - 1;
  const groupBy = columns.map(column => column.index);
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
    let previousTree: Record<DimensionValue, any> = treeIndex;

    groupBy.forEach((dimensionIndex, i) => {
      const dimensionValue = dataRow[dimensionIndex];
      rowHeader.push(dimensionValue);

      if (previousTree[dimensionValue] === undefined) {
        if (i === lastColumnNumber) {
          uniqueValues.push(rowHeader);
          index[uniqueValues.length - 1] = previousTree[dimensionValue] = [];
        } else {
          previousTree[dimensionValue] = {};
        }
      }
      if (i === lastColumnNumber) {
        previousTree[dimensionValue].push(rowNumber);
      }
      previousTree = previousTree[dimensionValue];
    });
  };

  const [, data, fragmentIndex] = frame[getData]();
  if (fragmentIndex) {
    fragmentIndex.forEach(rowNumber => rowIterator(data[rowNumber], rowNumber));
  } else {
    data.forEach(rowIterator);
  }

  return { uniqueValues, index };
};
