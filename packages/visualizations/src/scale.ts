import { scaleBand, scaleLinear, ScaleBand, ScaleTime, ScaleLinear } from "d3-scale";
import { IterableFrame, maxValue, uniqueValues, ColumnCursor } from "@operational/frame";
import { useMemo } from "react";
import { GroupFrame } from "@operational/frame";

export interface ScaleProps<Name extends string> {
  frame: IterableFrame<Name> | GroupFrame<Name>;
  column: ColumnCursor<Name>;
  range: [number, number];
  padding?: number;
}

/**
 * Takes `frame`, `column` (values in the column supposed to be strings) and `size` of container and
 * returns ScaleBand
 */
export const getScaleBand = <Name extends string>({ frame, column, range, padding = 0.1 }: ScaleProps<Name>) =>
  scaleBand()
    .domain(uniqueValues(frame, column))
    .range(range)
    .padding(padding);

/**
 * Takes `frame`, `column` (values in the column supposed to be numbers) and `size` of container and
 * returns ScaleLinear
 */
export const getScaleLinear = <Name extends string>({ frame, column, range }: ScaleProps<Name>) =>
  scaleLinear()
    .domain([0, maxValue(frame, column)])
    .range(range);

// Hook versions for convenience
export const useScaleBand = <Name extends string>({ frame, column, range, padding }: ScaleProps<Name>) =>
  useMemo(() => getScaleBand({ frame, column, range, padding }), [frame, column, range, padding]);

export const useScaleLinear = <Name extends string>({ frame, column, range }: ScaleProps<Name>) =>
  useMemo(() => getScaleLinear({ frame, column, range }), [frame, column, range]);

export type ScaleType = "linear" | "band"; // | "time" | "point"

export const useScale = <Name extends string>({
  frame,
  column,
  range,
  padding,
  type,
}: ScaleProps<Name> & { type: ScaleType }) =>
  useMemo(
    () =>
      type === "band" ? getScaleBand({ frame, column, range, padding }) : getScaleLinear({ frame, column, range }),
    [frame, column, range, padding, type],
  );

type ScaleAny = ScaleBand<any> | ScaleTime<any, any> | ScaleLinear<any, any>;

export const isScaleBand = (unknownScale: ScaleAny): unknownScale is ScaleBand<any> => {
  return "paddingInner" in unknownScale;
};

export const isScaleContinious = (
  unknownScale: ScaleAny,
): unknownScale is ScaleLinear<any, any> | ScaleTime<any, any> => {
  return "invert" in unknownScale;
};
