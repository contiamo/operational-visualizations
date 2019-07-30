import { ColumnCursor, RawRow } from "./types";

export const isCursor = (x: any): x is ColumnCursor<any> =>
  (!!x.index || x.index === 0) && x instanceof Function;

export const stackRowBy = <Name extends string>(categorical: ColumnCursor<Name>, metric: ColumnCursor<Name>) => {
  let prev: Record<string, number> = {};
  return (row: RawRow) => {
    const value = prev[categorical(row)] || 0;
    prev[categorical(row)] = value + metric(row);
    return value
  }
};
