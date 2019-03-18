import React from "react";
import { last } from "../../utils/helpers";
import { Accessors } from "../types";
import { valuesAreEqual } from "../utils";
import ColumnLabel from "./ColumnLabel";

import {
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
  RowOrColumn,
} from "../../data_handling/multidimensional_dataset";

interface Props {
  accessors: Accessors;
  columns: RowOrColumn[];
  dimension: DimensionWithPrimitiveAndMetadata;
  dimensionIndex: number;
  width: number;
}

interface DimensionValue {
  value: DimensionWithValueAndMetadata;
  width: number;
}

/**
 * Concatenates columns which are the same up to the given dimension index.
 * Returns the dimension value for the column at the correct dimension index, as well as the combined width of all subcolumns.
 */
const computeDimensionValues = ({ accessors, columns, dimensionIndex }: Props) => {
  let previous: DimensionWithValueAndMetadata[];
  return columns.reduce<DimensionValue[]>((memo, column) => {
    const dimensionValues = column.dimensionValues().slice(0, dimensionIndex + 1);
    previous && valuesAreEqual(previous, dimensionValues)
      ? (last(memo).width = last(memo).width + accessors.columns.width(column))
      : memo.push({ value: last(dimensionValues), width: accessors.columns.width(column) });
    previous = dimensionValues;
    return memo;
  }, []);
};

const ColumnHeader: React.SFC<Props> = props => (
  <>
    {/* Render dimension titles, if not empty */}
    {!props.accessors.dimensionTitle.hide(props.dimension) && (
      <ColumnLabel accessors={props.accessors.dimensionTitle} dimension={props.dimension} width={props.width} />
    )}
    {/* Render dimension value labels */}
    {computeDimensionValues(props).map((dimensionValue, j) => (
      <ColumnLabel
        accessors={props.accessors.dimensionLabel}
        dimension={dimensionValue.value}
        width={dimensionValue.width}
        key={j}
      />
    ))}
  </>
);

export default ColumnHeader;
