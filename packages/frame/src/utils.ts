import { ColumnCursor, RawRow } from "./types";

export const isCursor = (x: any): x is ColumnCursor<any> =>
  (!!x.index || x.index === 0) && x instanceof Function;

export const stackRowBy = <Name extends string>(categorical: ColumnCursor<Name>, metric: ColumnCursor<Name>) => {
  let value = 0;
  let prevRow: RawRow;
  return (row: RawRow) => {
    value = prevRow && categorical(prevRow) === categorical(row)
      ? value + metric(prevRow)
      : 0;
    prevRow = row;
    return value
  }
}
