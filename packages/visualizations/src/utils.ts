import { ColumnCursor } from "@operational/frame";

export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) =>
  (array || []).join(" / ");

export const hashCursors = <Name extends string = string>(columns: Array<ColumnCursor<Name>>) =>
  `${joinArrayAsString(columns.map(column => column.index))}`;
