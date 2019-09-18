import { format as d3Format } from "d3-format";

export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) => (array || []).join(" / ");

const removeTrailingZeros = (val: string) => {
  return val.replace(/0*$/g, "").replace(/\.$/, "");
};

export const numberFormatter = (val: number) => {
  if (Math.abs(val) > 100) {
    return removeTrailingZeros(d3Format(",.0f")(val));
  }
  if (Math.abs(val) > 10) {
    return removeTrailingZeros(d3Format(",.1f")(val));
  }
  if (Math.abs(val) > 1) {
    return removeTrailingZeros(d3Format(",.2f")(val));
  }
  return removeTrailingZeros(d3Format(",.3f")(val));
};
