import { IterableFrame, RowCursor, ColumnCursor } from "@operational/frame";
import theme from "./theme";
import { joinArrayAsString } from "./utils";
import { scaleOrdinal } from "d3-scale";
import { useMemo } from "react";

const defaultPalette = theme.palettes.qualitative.operational;

export const getColorScale = (frame: IterableFrame<string>, colorBy: Array<ColumnCursor<string>>, palette: string[] = defaultPalette) => {
  const uniqueValues = frame.uniqueValues(colorBy).map(joinArrayAsString);
  const scale = scaleOrdinal<string>().range(palette).domain(uniqueValues);

  if (colorBy.length === 0 || uniqueValues.length === 1) {
    return () => palette[0];
  }

  return (row: RowCursor) => {
    const valuesString = joinArrayAsString(colorBy.map(cursor => cursor(row)));
    return scale(valuesString) || "#000"
  };
};

// Hook version for convenience
export const useColorScale = (frame: IterableFrame<string>, colorBy: Array<ColumnCursor<string>>, palette?: string[]) =>
  useMemo(() => getColorScale(frame, colorBy, palette), [frame, colorBy, palette]);
