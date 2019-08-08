export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) =>
  (array || []).join(" / ");
