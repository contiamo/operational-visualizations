export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: string[]) => {
  return (array || []).join(" / ");
};
