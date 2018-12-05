import { scaleTime, ScaleTime } from "d3-scale"
import { forEach, keys, last, mapValues, times } from "lodash/fp"
import { AxisPosition, InputData, InputDatum, TimeAxisOptions, TimeIntervals, TimeAxisComputed, Extent, DiscreteInputData, DiscreteInputDatum, AxisRecord } from "./typings"
import { timeFormat } from "d3-time-format"
import * as Moment from "moment"
import { extendMoment } from "moment-range"
import { timeMonday } from "d3-time";
const moment: any = extendMoment(Moment)
import defaultOptions from "./axis_config"
import { computeRuleTicks, computeTickWidth } from "./discrete_axis_utils"

type Datum = DiscreteInputDatum<Date, TimeAxisOptions>;

type Scale = ScaleTime<number, number>;

// @TODO - add in more options
// Have removed "now", and any formatting to account for change in month/year
export const tickFormatter = (interval: TimeIntervals) => {
  switch (interval) {
    case "hour":
      return timeFormat("%b %d %H:00")
    case "day":
      return timeFormat("%b %d")
    case "week":
      return timeFormat("W%W")
    case "month":
      return timeFormat("%b %y")
    case "quarter":
      return (d: Date): string => timeFormat(`Q${Math.floor((d.getMonth() + 3) / 3)} %Y`)(d)
    case "year":
      return timeFormat("%Y")
    default:
      throw new Error(`Interval of length ${interval} is not supported.`)
  }
}

const computeTickArray = (datum: Datum, scale: Scale, formatter: (value: Date) => string) => {
  let ticksToShow: Date[];
  const width = Math.abs(datum.range[1] - datum.range[0])
  const tickNumber = Math.min(datum.values.length, Math.max(Math.floor(width / datum.options.tickSpacing), datum.options.minTicks))
  if (datum.options.interval === "week") {
    const mondayTicks = scale.ticks(timeMonday)
    ticksToShow = mondayTicks.filter((tick: Date, i: number) => i % 6 === 0)
  } else {
    const ticks = scale.ticks(tickNumber || 1)
    ticksToShow = ticks.length > datum.values.length ? datum.values : ticks;
  }

  return datum.values.map(value => ({
    value,
    hideTick: !ticksToShow.map(tick => tick.toString()).includes(value.toString()),
    position: scale(value),
    label: formatter(value)
  }))
}

const addNextTick = (ticks: Date[], interval: TimeIntervals) =>
  () => ticks.push(
    moment.default(last(ticks))
      .add(1, interval)
      .toDate()
  )

const alignAxes = (axes: DiscreteInputData<Date, TimeAxisOptions>) => {
  forEach((axis: Datum) => axis.values = ticksInDomain(axis.options))(axes)

  // If there is only one axes, no alignment is necessary
  const axisKeys = keys(axes);
  if (axisKeys.length === 1) {
    return
  }

  // If either axis has bars, both need to be computed as if they have bars
  const hasBarsOne = axes[axisKeys[0]].hasBars
  const hasBarsTwo = axes[axisKeys[1]].hasBars
  if (hasBarsOne || hasBarsTwo) {
    axes[axisKeys[0]].hasBars = true
    axes[axisKeys[1]].hasBars = true
  }

  // Check that both axes have the same interval
  const intervalOne = axes[axisKeys[0]].options.interval
  const intervalTwo = axes[axisKeys[1]].options.interval

  if (intervalOne !== intervalTwo) {
    throw new Error("Time axes must have the same interval")
  }

  // Ensure both axes have the same number of ticks by adding the next tick(s) in the series as required
  const ticksOne = ticksInDomain(axes[axisKeys[0]].options)
  const ticksTwo = ticksInDomain(axes[axisKeys[1]].options)

  ticksOne.length < ticksTwo.length
    ? times(addNextTick(ticksOne, intervalOne))(ticksTwo.length - ticksOne.length)
    : times(addNextTick(ticksTwo, intervalTwo))(ticksOne.length - ticksTwo.length)

  axes[axisKeys[0]].values = ticksOne
  axes[axisKeys[1]].values = ticksTwo
}

export const ticksInDomain = (options: TimeAxisOptions): Date[] =>
  Array.from(
    moment
      .range(options.start, options.end)
      .by(options.interval)
  ).map((d: any) => d.toDate())

const adjustRange = (range: Extent, datum: Datum): Extent => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, datum.hasBars)
  return range[1] > range[0]
    ? [range[0] + tickWidth / 2, range[1] - tickWidth / 2]
    : [range[0] - tickWidth / 2, range[1] + tickWidth / 2]
}

export default (data: DiscreteInputData<Date, TimeAxisOptions>): AxisRecord<TimeAxisComputed> => {
  keys(data).forEach((axis: AxisPosition) => {
    data[axis].options = {
      ...defaultOptions(data[axis].options.type, axis),
      ...data[axis].options
    } as TimeAxisOptions
  })

  alignAxes(data)

  return mapValues((datum: Datum): TimeAxisComputed => {
    const adjustedRange = adjustRange(datum.range, datum)
    const scale = scaleTime().range(adjustedRange).domain([datum.values[0], last(datum.values)])
    const formatter = tickFormatter(datum.options.interval)

    return {
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      range: datum.range,
      formatter,
      ticks: computeTickArray(datum, scale, formatter),
      rules: computeRuleTicks(datum, scale),
      options: datum.options
    }
  })(data)
}
