import { ColumnCursor } from "./types";

export const isCursor = (x: any): x is ColumnCursor<any> =>
  (!!x.index || x.index === 0) && x instanceof Function;
