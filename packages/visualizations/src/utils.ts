export const isFunction = (x: any): x is Function => {
  return !!(x && x.constructor && x.call && x.apply);
};
