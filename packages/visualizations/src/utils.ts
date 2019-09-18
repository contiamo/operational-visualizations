import { format as d3Format } from "d3-format";

export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) => (array || []).join(" / ");

export const numberFormatter = (val: number) => {
  if (val > 100) {
    return d3Format(",.0f");
  }
  if (val > 10) {
    return d3Format(",.1f");
  }
  if (val > 0) {
    return d3Format(",.2f");
  }
  return d3Format(".,3f");
};
