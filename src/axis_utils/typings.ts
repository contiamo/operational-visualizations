import { ScaleLinear, ScaleBand, ScaleTime } from "d3-scale";

// Axis configuration
export interface AxisConfig {
  fontSize: number
  margin: number
  minTicks: number
  outerPadding: number
  rotateLabels: boolean
  showRules: boolean
  showTicks: boolean
  showLabels: boolean
  tickOffset: number
  tickSpacing: number
  title?: string
  titleFontSize: number
  minTopOffsetTopTick?: number
}

type BaseAxisOptions = Partial<AxisConfig> & {
  type: AxisType;
}

export interface QuantAxisOptions extends BaseAxisOptions {
  type: "quant";
  start?: number;
  end?: number;
  interval?: number;
  ruleInterval?: number;
  tickInterval?: number;
}

export interface CategoricalAxisOptions extends BaseAxisOptions {
  type: "categorical";
  values: string[];
}

export interface TimeAxisOptions extends BaseAxisOptions {
  type: "time";
  start: Date;
  end: Date;
  interval: TimeIntervals;
}

export type AxisOptions = QuantAxisOptions | CategoricalAxisOptions | TimeAxisOptions;

// Inputs for axis calculations
export interface InputDatum<TValue, TOptions> {
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

export type InputData<TValue, TOptions> = Partial<Record<AxisPosition, InputDatum<TValue, TOptions>>>;

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
  tickWidth: number;
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

export interface BarsInfo {
  barWidth?: number;
  stackIndex?: number;
}

export interface ComputedSeries {
  barSeries: Record<string, BarsInfo>,
  barIndices: Record<string, number>
}

export interface BaseConfig {
  innerBarSpacing: number;
  minBarWidth: number
}

export type AxisOrientation = "x" | "y";

export type AxisPosition = "x1" | "x2" | "y1" | "y2";

export type AxisType = "quant" | "categorical" | "time";

export type TimeIntervals = "hour" | "day" | "week" | "month" | "quarter" | "year";

export type AxesData = Partial<Record<AxisPosition, AxisOptions | ComputedAxisInput>>;
