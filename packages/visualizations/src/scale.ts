import { IterableFrame, maxValue, uniqueValues, ColumnCursor } from "@operational/frame";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { GroupedFrame } from "@operational/frame";

// for now band scale doesn't support GroupedFrame as an input,
// that is why we use two separate interfaces for band and linear
export interface BandScaleProps<Name extends string> {
  frame: IterableFrame<Name>;
  column: ColumnCursor<Name>;
  range: [number, number];
  padding?: number;
}

export interface LinearScaleProps<Name extends string> {
  frame: IterableFrame<Name> | GroupedFrame<Name>;
  column: ColumnCursor<Name>;
  range: [number, number];
  padding?: number;
}

/**
 * Takes `frame`, `column` (values in the column supposed to be strings) and `size` of container and
 * returns ScaleBand
 */
export const getScaleBand = <Name extends string>({ frame, column, range, padding = 0.1 }: BandScaleProps<Name>) =>
  scaleBand()
    .domain(uniqueValues(frame, column))
    .range(range)
    .padding(padding);

/**
 * Takes `frame`, `column` (values in the column supposed to be numbers) and `size` of container and
 * returns ScaleLinear
 */
export const getScaleLinear = <Name extends string>({ frame, column, range }: LinearScaleProps<Name>) =>
  scaleLinear()
    .domain([0, maxValue(frame, column)])
    .range(range);

// Hook versions for convenience
export const useScaleBand = <Name extends string>({ frame, column, range, padding }: BandScaleProps<Name>) =>
  useMemo(() => getScaleBand({ frame, column, range, padding }), [frame, column, range, padding]);

export const useScaleLinear = <Name extends string>({ frame, column, range }: LinearScaleProps<Name>) =>
  useMemo(() => getScaleLinear({ frame, column, range }), [frame, column, range]);
