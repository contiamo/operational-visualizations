export interface AxisConfig {
  fontSize: number
  margin: number
  minTicks: number
  outerPadding: number
  rotateLabels: boolean
  showRules: boolean
  showTicks: boolean
  tickOffset: number
  tickSpacing: number
  title: string
  titleFontSize: number
  minTopOffsetTopTick?: number
}

export interface InputDatum<TValue, TOptions> {
  range: Extent;
  values: TValue[];
  options: TOptions;
}

export type InputData<TValue, TOptions> = Record<AxisPosition, InputDatum<TValue, TOptions>>;

export interface Tick {
  /** Tick position on axis */
  position: number;
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

export interface AxisComputed<TScale, TValue> {
  /** Axis scale */
  scale: TScale;
  /** Length of axis */
  length: number;
  /** Ticks */
  ticks: Tick[];
  /** Position of rules */
  rules: Rule[];
}

export type Extent = [number, number];

export interface BarsInfo {
  barWidth: number;
  stackIndex: number;
}

export type AxisOrientation = "x" | "y";

export type AxisPosition = "x1" | "x2" | "y1" | "y2";

export type AxisType = "quant" | "categorical" | "time";

export type TimeIntervals = "hour" | "day" | "week" | "month" | "quarter" | "year";

type BaseAxisOptions = AxisConfig & {
  type: AxisType;
}

export interface QuantAxisOptions extends BaseAxisOptions {
  type: "quant";
  tickSpacing: number;
  minTicks: number;
  start?: number;
  end?: number;
  interval?: number;
  ruleInterval?: number;
  tickInterval: number;
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

export type AxisOptions = TimeAxisOptions | QuantAxisOptions | CategoricalAxisOptions;

export interface ComputedSeries {
  barSeries: Record<string, BarsInfo>,
  barIndices: Record<string, number>
}

export interface BaseConfig {
  innerBarSpacing: number;
  minBarWidth: number
}
