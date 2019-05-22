import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { maxValue, uniqueValues } from "../DataFrame/stats";
import { IteratableFrame } from "../DataFrame/types";

export interface ScaleProps<Name extends string> {
  frame: IteratableFrame<Name>;
  column: Name;
  size: number;
}

/**
 * Takes `frame`, `column` (values in the column supposed to be strings) and `size` of container and
 * returns ScaleBand
 */
export const getScaleBand = <Name extends string>({ frame, column, size }: ScaleProps<Name>) =>
  scaleBand()
    .domain(uniqueValues(frame, column))
    .range([0, size]);

/**
 * Takes `frame`, `column` (values in the column supposed to be numbers) and `size` of container and
 * returns ScaleLinear
 */
export const getScaleLinear = <Name extends string>({ frame, column, size }: ScaleProps<Name>) =>
  scaleLinear()
    .domain([0, maxValue(frame, column)])
    .range([0, size]);

// Hook versions for convenience

export const useScaleBand = <Name extends string>({ frame, column, size }: ScaleProps<Name>) =>
  useMemo(() => getScaleBand({ frame, column, size }), [frame, column, size]);

export const useScaleLinear = <Name extends string>({ frame, column, size }: ScaleProps<Name>) =>
  useMemo(() => getScaleLinear({ frame, column, size }), [frame, column, size]);
