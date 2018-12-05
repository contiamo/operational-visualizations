import { scaleBand, ScaleBand } from "d3-scale"
import { keys, mapValues } from "lodash/fp"
import { AxisPosition, CategoricalAxisOptions, CategoricalAxisComputed, Tick, Extent, DiscreteInputData, DiscreteInputDatum, AxisRecord } from "./typings"
import defaultOptions from "./axis_config"
import { computeRuleTicks, computeTickWidth } from "./discrete_axis_utils"

type Datum = DiscreteInputDatum<string, CategoricalAxisOptions>;

type Scale = ScaleBand<string>;

const computeTickArray = (values: string[], scale: Scale): Tick<string>[] =>
  values.map(value => ({
    value,
    position: scale(value),
    label: value
  }))

const adjustRange = (datum: Datum): Extent => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, true)
  return [datum.range[0] + tickWidth / 2, datum.range[1] + tickWidth / 2]
}

export default (data: DiscreteInputData<string, CategoricalAxisOptions>): AxisRecord<CategoricalAxisComputed> => {
  if (keys(data).length > 1) {
    throw new Error("Categorical axes cannot be aligned.")
  }

  keys(data).forEach((axis: AxisPosition) => {
    data[axis].options = {
      ...defaultOptions(data[axis].options.type, axis),
      ...data[axis].options
    } as CategoricalAxisOptions
  })

  return mapValues((datum: Datum): CategoricalAxisComputed => {
    const adjustedRange = adjustRange(datum)
    const scale = scaleBand().range(adjustedRange).domain(datum.values)

    return {
      scale,
      length: Math.abs(datum.range[1] - datum.range[0]),
      range: datum.range,
      ticks: computeTickArray(datum.values, scale),
      rules: computeRuleTicks(datum, scale),
      options: datum.options
    }
  })(data)
}
