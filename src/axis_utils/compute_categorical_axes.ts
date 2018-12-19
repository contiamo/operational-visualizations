import { scaleBand, ScaleBand } from "d3-scale";
import { identity, keys, LodashMapValues, mapValues } from "lodash/fp";
import { WithConvert } from "../shared/typings";
import defaultOptions from "./axis_config";
import { computeRuleTicks, computeTickWidth } from "./discrete_axis_utils";

import {
  AxisPosition,
  AxisRecord,
  CategoricalAxisComputed,
  CategoricalAxisOptions,
  DiscreteInputData,
  DiscreteInputDatum,
  Extent,
  FullCategoricalAxisOptions,
  Tick,
} from "./typings";

type Datum = DiscreteInputDatum<string, CategoricalAxisOptions>;
type Data = DiscreteInputData<string, CategoricalAxisOptions>;
type Scale = ScaleBand<string>;

const computeTickArray = (values: string[], scale: Scale): Array<Tick<string>> =>
  values.map(value => ({
    value,
    position: scale(value) || 0,
    label: value,
  }));

export const adjustRange = (datum: Datum): Extent => {
  const tickWidth = computeTickWidth(datum.range, datum.values.length, true);
  return [datum.range[0] + tickWidth / 2, datum.range[1] + tickWidth / 2];
};

export default (data: Data): AxisRecord<CategoricalAxisComputed> => {
  if (keys(data).length > 1) {
    throw new Error("Categorical axes cannot be aligned.");
  }

  return (mapValues as WithConvert<LodashMapValues>).convert({ cap: false })(
    (datum: Datum, axis: AxisPosition): CategoricalAxisComputed => {
      const fullOptions: FullCategoricalAxisOptions = {
        ...defaultOptions(datum.options.type, axis),
        ...datum.options,
      };
      const adjustedRange = adjustRange(datum);
      const scale = scaleBand()
        .range(adjustedRange)
        .domain(datum.values);

      return {
        scale,
        length: Math.abs(datum.range[1] - datum.range[0]),
        range: datum.range,
        formatter: identity,
        ticks: computeTickArray(datum.values, scale),
        rules: computeRuleTicks(datum, scale),
        options: fullOptions,
      };
    },
  )(data);
};
