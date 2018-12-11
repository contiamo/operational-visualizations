import { ScaleLinear, ScaleBand, ScaleTime } from "d3-scale";
import { tuple } from "../shared/typings";
export { AxisProps } from "../Axis/Axis"

/** Axis configuration */
export interface AxisConfig {
  /** Font size for tick labels. */
  fontSize: number;
  /** Boolean to hide axis ticks and labels. Reduces axis margin to 0, displays only the axis line. */
  hideAxis: boolean;
  /** Axis margin. */
  margin: number;
  /** Minimum number of ticks to display. */
  minTicks: number;
  /** Offset of labels from axis line. */
  labelOffset: number
  /** Padding between edge of axis and edge of drawing container. */
  outerPadding: number;
  /** Rotates labels to a 45° angle. */
  rotateLabels: boolean;
  /** Toggles display of rules between ticks. */
  showRules: boolean;
  /** Toggles display of tick lines. */
  showTicks: boolean;
  /** Toggles display of tick labels. */
  showLabels: boolean;
  /** Length of ticks. */
  tickLength: number;
  /** Optimal distance between ticks. */
  tickSpacing: number;
  /** Axis title (optional). */
  title?: string;
  /** Font size for axis title. */
  titleFontSize: number;
  /** Minimum distance between top of y axis and top tick. */
  minTopOffsetTopTick?: number;
}

type BaseAxisOptions = Partial<AxisConfig> & {
  /** Axis type */
  type: AxisType;
}

export interface QuantAxisOptions extends BaseAxisOptions {
  type: "quant";
  /** Hardcoded start value for axis. */
  start?: number;
  /** Hardcoded end value for axis. */
  end?: number;
  /** Hardcoded interval between ticks. */
  tickInterval?: number;
  /** Hardcoded interval between rules. */
  ruleInterval?: number;
  /** Hardcoded interval between displayed tick labels. */
  labelInterval?: number;
}

export interface CategoricalAxisOptions extends BaseAxisOptions {
  type: "categorical";
  /** Array of tick values to display, in order. */
  values: string[];
}

export interface TimeAxisOptions extends BaseAxisOptions {
  type: "time";
  /** Start date */
  start: Date;
  /** End date */
  end: Date;
  /** Tick interval */
  interval: TimeIntervals;
}

export type AxisOptions = QuantAxisOptions | CategoricalAxisOptions | TimeAxisOptions;

// Inputs for axis calculations
export interface InputDatum<TValue=any, TOptions=any> {
  /** Axis range, from left-to-right (x-axes) or top-to-bottom (y-axes) */
  range: Extent;
  /**
   * Values to be plotted on axis, used to compute quant axis intervals and categorical axis ticks.
   * Not used for time axis calculations.
   */
  values: TValue[];
  /** Axis config options */
  options: TOptions;
}

export type DiscreteInputDatum<TValue=any, TOptions=any> = InputDatum<TValue, TOptions> & {
  /** Whether bars are to be displayed on the axis. Default: false. */
  hasBars?: boolean;
}

export type AxisRecord<TRecord> = Partial<Record<AxisPosition, TRecord>>;

export type InputData<TValue=any, TOptions=any> = AxisRecord<InputDatum<TValue, TOptions>>;

export type DiscreteInputData<TValue=any, TOptions=any> = AxisRecord<DiscreteInputDatum<TValue, TOptions>>;

// Computed
export interface Tick<TValue> {
  /** Tick position on axis */
  position: number;
  /** Value at tick */
  value: TValue;
  /** Should tick be hidden due to lack of space */
  hideTick?: boolean;
  /** Label to display at tick, if any */
  label?: string;
  /** Class name for additional formatting */
  class?: string;
}

export interface Rule {
  /** Rule position */
  position: number,
  /** Rule class */
  class?: string
}

export type Extent = [number, number];

export interface BaseAxisComputed<TScale, TValue> {
  /** Axis scale */
  scale: TScale;
  /** Full range of axis */
  range: Extent;
  /** Length of axis */
  length: number;
  /** Ticks */
  ticks: Tick<TValue>[];
  /** Position of rules */
  rules: Rule[];
  /** Options */
  options: AxisOptions;
}

export type QuantAxisComputed = BaseAxisComputed<ScaleLinear<number, number>, number>;

type DiscreteAxisComputed<TScale, TValue> = BaseAxisComputed<TScale, TValue> & {
  range: Extent;
  width? : (seriesId: string) => number;
  offset? : (seriesId: string) => number;
}

export type CategoricalAxisComputed = DiscreteAxisComputed<ScaleBand<string>, string>;

export type TimeAxisComputed = DiscreteAxisComputed<ScaleTime<number, number>, Date> & {
  formatter: (value: Date) => string;
};

export type AxisComputed = QuantAxisComputed | CategoricalAxisComputed | TimeAxisComputed;

export interface ComputedAxisInput {
  type: "computed";
  computed: AxisComputed;
}

export interface BarSeries {
  barWidth?: number;
  index: number;
  stackIndex?: number;
}

export type BarSeriesInfo = Record<string, BarSeries>

export const AXIS_ORIENTATIONS = tuple("x", "y");
export type AxisOrientation = typeof AXIS_ORIENTATIONS[number];

export const AXIS_POSITIONS = tuple("x1", "x2", "y1", "y2");
export type AxisPosition = typeof AXIS_POSITIONS[number];

export const AXIS_TYPE = tuple("quant", "categorical", "time");
export type AxisType = typeof AXIS_TYPE[number];

export const TIME_INTERVALS = tuple("hour", "day", "week", "month", "quarter", "year");
export type TimeIntervals = typeof TIME_INTERVALS[number];

export type AxesData = AxisRecord<AxisOptions | ComputedAxisInput>;
