import { AxialChartProps } from "./types";

// TypeScript can't handle this case normally :/
export const getStyleProp = (style: AxialChartProps<string>["style"]) =>
  typeof style === "function"
    ? { isFunction: true as true, style }
    : { isFunction: false as false, style };
