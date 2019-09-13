import { IterableFrame, ColumnCursor } from "@operational/frame";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { isScaleBand } from "./scale";

export const isFunction = (x: any): x is Function => x instanceof Function;

export const joinArrayAsString = (array: any[]) => (array || []).join(" / ");

export const fillHoles = (
  data: IterableFrame<string>,
  x: ColumnCursor<string>,
  y: ColumnCursor<string>,
  xScale: ScaleBand<string> | ScaleLinear<number, number>,
  yScale: ScaleBand<string> | ScaleLinear<number, number>,
) => {
  const xTicks = isScaleBand(xScale) ? xScale.domain() : [];
  const yTicks = isScaleBand(yScale) ? yScale.domain() : [];

  // TODO: check if arrays of the same length and don't try to "fill holes"
  // TODO: this algorithm doesn't work with "unsorted" data
  let offset = 0;
  return xTicks.length > 0
    ? xTicks.map((z, i) => {
        let row = data.row(i + offset) || [];
        if (z !== x(row)) {
          offset -= 1;
          const reuslt: any[] = [];
          reuslt[x.index] = z;
          return reuslt;
        }
        return row;
      })
    : yTicks.map((z, i) => {
        let row = data.row(i + offset) || [];
        if (z !== y(row)) {
          offset -= 1;
          const reuslt: any[] = [];
          reuslt[y.index] = z;
          return reuslt;
        }
        return row;
      });
};
