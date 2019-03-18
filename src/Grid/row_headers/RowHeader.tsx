import React from "react";
import { last } from "../../utils/helpers";
import { Accessors } from "../types";
import { valuesAreEqual } from "../utils";
import RowLabel from "./RowLabel";

import {
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
  RowOrColumn,
} from "../../data_handling/multidimensional_dataset";

interface Props {
  accessors: Accessors;
  dimension: DimensionWithPrimitiveAndMetadata;
  dimensionIndex: number;
  rows: RowOrColumn[];
  width: number;
}

interface DimensionValue {
  value: DimensionWithValueAndMetadata;
  height: number;
}

const containerStyle = ({ width, accessors, dimension }: Props): React.CSSProperties => {
  return {
    float: "left",
    ...(accessors.rowHeaders.orientation(dimension) === "horizontal"
      ? {
          marginTop: accessors.dimensionTitle.hide(dimension) ? 0 : -accessors.dimensionTitle.lineHeight(dimension),
          width: accessors.rowHeaders.columnWidths(dimension),
        }
      : {
          width,
        }),
  };
};

/** Height of vertical titles */
const verticalTitleHeight = ({ accessors, rows }: Props) =>
  rows.reduce<number>((height, row) => height + accessors.rows.height(row), 0);

/**
 * Concatenates rows which are the same up to the given dimension index.
 * Returns the dimension value for the row at the correct dimension index,
 * as well as the combined heights of all subrows.
 */
const computeDimensionValues = ({ accessors, rows, dimensionIndex }: Props) => {
  let previous: DimensionWithValueAndMetadata[];
  return rows.reduce<DimensionValue[]>((memo, row) => {
    const dimensionValues = row.dimensionValues().slice(0, dimensionIndex + 1);
    if (previous && valuesAreEqual(previous, dimensionValues)) {
      last(memo).height = last(memo).height + accessors.rows.height(row);
    } else {
      memo.push({
        value: last(dimensionValues),
        height: accessors.rows.height(row),
      });
    }
    previous = dimensionValues;
    return memo;
  }, []);
};

const RowHeader: React.SFC<Props> = props => {
  const { accessors, dimension } = props;
  const isHorizontal = accessors.rowHeaders.orientation(dimension) === "horizontal";

  return (
    <div style={containerStyle(props)} key={dimension.key}>
      {/* Render dimension titles, if not empty */}
      {!accessors.dimensionTitle.hide(dimension) && (
        <RowLabel
          accessors={accessors.dimensionTitle}
          dimension={dimension}
          height={isHorizontal ? accessors.dimensionTitle.lineHeight(dimension) : verticalTitleHeight(props)}
          width={
            isHorizontal ? accessors.rowHeaders.columnWidths(dimension) : accessors.dimensionTitle.lineHeight(dimension)
          }
          isHorizontal={isHorizontal}
        />
      )}
      {/* Render dimension value labels */}
      {computeDimensionValues(props).map((dimensionValue, j) => (
        <RowLabel
          accessors={accessors.dimensionLabel}
          dimension={dimensionValue.value}
          height={dimensionValue.height}
          width={
            isHorizontal ? accessors.rowHeaders.columnWidths(dimension) : accessors.dimensionLabel.lineHeight(dimension)
          }
          isHorizontal={isHorizontal}
          key={j}
        />
      ))}
    </div>
  );
};

export default RowHeader;
