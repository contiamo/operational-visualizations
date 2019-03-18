import { DimensionWithValueAndMetadata } from "../data_handling/multidimensional_dataset";

/** Check if 2 array of dimension values are equal */
export const valuesAreEqual = (previous: DimensionWithValueAndMetadata[], current: DimensionWithValueAndMetadata[]) =>
  previous.every((dimValue, i) => current[i].value === dimValue.value);
