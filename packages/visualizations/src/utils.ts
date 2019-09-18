import { format as d3Format } from "d3-format";

export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) => (array || []).join(" / ");

export const numberFormatter = d3Format(",.2f");
