import { ScaleBand, ScaleLinear, ScaleTime } from "d3-scale";
export { AxisProps } from "../Axis/Axis";
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
    labelOffset: number;
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
interface BaseAxisOptions {
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
export declare type AxisOptions = Partial<AxisConfig> & (QuantAxisOptions | CategoricalAxisOptions | TimeAxisOptions);
export declare type FullQuantAxisOptions = AxisConfig & QuantAxisOptions;
export declare type FullCategoricalAxisOptions = AxisConfig & CategoricalAxisOptions;
export declare type FullTimeAxisOptions = AxisConfig & TimeAxisOptions;
export declare type FullAxisOptions = FullQuantAxisOptions | FullCategoricalAxisOptions | FullTimeAxisOptions;
export interface InputDatum<TValue = any, TOptions = any> {
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
export declare type DiscreteInputDatum<TValue = any, TOptions = any> = InputDatum<TValue, TOptions> & {
    /** Whether bars are to be displayed on the axis. Default: false. */
    hasBars?: boolean;
};
export declare type AxisRecord<TRecord> = Partial<Record<AxisPosition, TRecord>>;
export declare type InputData<TValue = any, TOptions = any> = AxisRecord<InputDatum<TValue, TOptions>>;
export declare type DiscreteInputData<TValue = any, TOptions = any> = AxisRecord<DiscreteInputDatum<TValue, TOptions>>;
export interface Tick<TValue = any> {
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
    position: number;
    /** Rule class */
    class?: string;
}
export declare type Extent = [number, number];
export interface BaseAxisComputed<TScale, TValue> {
    /** Axis scale */
    scale: TScale;
    /** Full range of axis */
    range: Extent;
    /** Length of axis */
    length: number;
    /** Label formatter */
    formatter: (value: TValue) => string;
    /** Ticks */
    ticks: Array<Tick<TValue>>;
    /** Position of rules */
    rules: Rule[];
    /** Options */
    options: FullAxisOptions;
}
export declare type QuantAxisComputed = BaseAxisComputed<ScaleLinear<number, number>, number>;
declare type DiscreteAxisComputed<TScale, TValue> = BaseAxisComputed<TScale, TValue> & {
    range: Extent;
    width?: (seriesId: string) => number;
    offset?: (seriesId: string) => number;
};
export declare type CategoricalAxisComputed = DiscreteAxisComputed<ScaleBand<string>, string>;
export declare type TimeAxisComputed = DiscreteAxisComputed<ScaleTime<number, number>, Date>;
export declare type AxisComputed = QuantAxisComputed | CategoricalAxisComputed | TimeAxisComputed;
export interface ComputedAxisInput {
    type: "computed";
    computed: AxisComputed;
}
export interface BarSeries {
    barWidth?: number;
    index: number;
    stackIndex?: number;
}
export declare type BarSeriesInfo = Record<string, BarSeries>;
export declare const AXIS_ORIENTATIONS: ["x", "y"];
export declare type AxisOrientation = typeof AXIS_ORIENTATIONS[number];
/**
 * x1 is the bottom x-axis
 * x2 is the top x-axis
 * y1 is the left y-axis
 * y2 is the right y-axis
 */
export declare const AXIS_POSITIONS: ["x1", "x2", "y1", "y2"];
export declare type AxisPosition = typeof AXIS_POSITIONS[number];
export declare const AXIS_TYPE: ["quant", "categorical", "time"];
export declare type AxisType = typeof AXIS_TYPE[number];
export declare const TIME_INTERVALS: ["hour", "day", "week", "month", "quarter", "year"];
export declare type TimeIntervals = typeof TIME_INTERVALS[number];
export declare type AxesData = AxisRecord<AxisOptions | ComputedAxisInput>;
//# sourceMappingURL=typings.d.ts.map