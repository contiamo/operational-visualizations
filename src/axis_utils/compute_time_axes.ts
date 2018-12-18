import { scaleTime, ScaleTime } from "d3-scale";
import { timeMonday } from "d3-time";
import { timeFormat } from "d3-time-format";
import { forEach, keys, last, LodashMapValues, mapValues, times, values } from "lodash/fp";
import * as Moment from "moment";
import { extendMoment } from "moment-range";
import { WithConvert } from "../shared/typings";
import defaultOptions from "./axis_config";
import { computeRuleTicks, computeTickWidth } from "./discrete_axis_utils";
import {
  AxisPosition,
  AxisRecord,
  DiscreteInputData,
  DiscreteInputDatum,
  Extent,
  FullTimeAxisOptions,
  TimeAxisComputed,
  TimeAxisOptions,
  TimeIntervals,
} from "./typings";

const moment: any = extendMoment(Moment as any);

type Datum = DiscreteInputDatum<Date, TimeAxisOptions>;
type Data = DiscreteInputData<Date, TimeAxisOptions>;
type Scale = ScaleTime<number, number>;

// @TODO - add in more options
// Have removed "now", and any formatting to account for change in month/year
export const tickFormatter = (interval: TimeIntervals) => {
  switch (interval) {
    case "hour":
      return timeFormat("%b %d %H:00");
    case "day":
      return timeFormat("%b %d");
    case "week":
      return timeFormat("W%W");
    case "month":
      return timeFormat("%b %y");
    case "quarter":
      return (d: Date): string => timeFormat(`Q${Math.floor((d.getMonth() + 3) / 3)} %Y`)(d);
    case "year":
      return timeFormat("%Y");
    default:
      throw new Error(`Interval of length ${interval} is not supported.`);
  }
};

const computeTickArray = (datum: Datum, options: FullTimeAxisOptions, scale: Scale) => {
  let ticksToShow: Date[];
  const width = Math.abs(datum.range[1] - datum.range[0]);
  const tickNumber = Math.min(datum.values.length, Math.max(Math.floor(width / options.tickSpacing), options.minTicks));
  if (options.interval === "week") {
    const mondayTicks = scale.ticks(timeMonday);
    ticksToShow = mondayTicks.filter((_: Date, i: number) => i % 6 === 0);
  } else {
    const ticks = scale.ticks(tickNumber || 1);
    ticksToShow = ticks.length > datum.values.length ? datum.values : ticks;
  }

  return datum.values.map(value => ({
    value,
    hideTick: !ticksToShow.map(tick => tick.toString()).includes(value.toString()),
    position: scale(value),
    label: tickFormatter(options.interval)(value),
  }));
};

const addNextTick = (ticks: Date[], interval: TimeIntervals) => () =>
  ticks.push(
    moment
      .default(last(ticks))
      .add(1, interval)
      .toDate(),
  );

const alignAxes = (axes: Data) => {
  forEach((axis: Datum) => (axis.values = ticksInDomain(axis.options)))(axes);

  // If there is only one axis, no alignment is necessary
  if (keys(axes).length === 1) {
    return;
  }

  // If either axis has bars, both need to be computed as if they have bars
  const [axisOne, axisTwo] = values(axes) as [Datum, Datum];
  const hasBarsOne = axisOne.hasBars;
  const hasBarsTwo = axisTwo.hasBars;
  if (hasBarsOne || hasBarsTwo) {
    axisOne.hasBars = true;
    axisTwo.hasBars = true;
  }

  // Check that both axes have the same interval
  const intervalOne = axisOne.options.interval;
  const intervalTwo = axisTwo.options.interval;

  if (intervalOne !== intervalTwo) {
    throw new Error("Time axes must have the same interval");
  }

  // Ensure both axes have the same number of ticks by adding the next tick(s) in the series as required
  const ticksOne = ticksInDomain(axisOne.options);
  const ticksTwo = ticksInDomain(axisTwo.options);

  ticksOne.length < ticksTwo.length
    ? times(addNextTick(ticksOne, intervalOne))(ticksTwo.length - ticksOne.length)
    : times(addNextTick(ticksTwo, intervalTwo))(ticksOne.length - ticksTwo.length);

  axisOne.values = ticksOne;
  axisTwo.values = ticksTwo;
};

export const ticksInDomain = (options: TimeAxisOptions): Date[] =>
  Array.from(moment.range(options.start, options.end).by(options.interval)).map((d: any) => d.toDate());

export const adjustRange = (datum: Datum): Extent => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, datum.hasBars);
  return datum.range[1] > datum.range[0]
    ? [datum.range[0] + tickWidth / 2, datum.range[1] - tickWidth / 2]
    : [datum.range[0] - tickWidth / 2, datum.range[1] + tickWidth / 2];
};

export default (data: Data): AxisRecord<TimeAxisComputed> => {
  alignAxes(data);

  return (mapValues as WithConvert<LodashMapValues>).convert({ cap: false })(
    (datum: Datum, axis: AxisPosition): TimeAxisComputed => {
      const fullOptions: FullTimeAxisOptions = {
        ...defaultOptions(datum.options.type, axis),
        ...datum.options,
      };
      const adjustedRange = adjustRange(datum);
      const scale = scaleTime()
        .range(adjustedRange)
        .domain([datum.values[0], datum.values[datum.values.length - 1]]);
      const formatter = tickFormatter(datum.options.interval);

      return {
        scale,
        length: Math.abs(datum.range[1] - datum.range[0]),
        range: datum.range,
        formatter,
        ticks: computeTickArray(datum, fullOptions, scale),
        rules: computeRuleTicks(datum, scale),
        options: fullOptions,
      };
    },
  )(data);
};
