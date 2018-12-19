import { format } from "d3-format";
import { flow } from "lodash/fp";

const defaultNumberFormatter: (x: number) => string = flow(
  format(".2f"),
  (val: string): number => +val,
  format(","),
);

export default defaultNumberFormatter;
