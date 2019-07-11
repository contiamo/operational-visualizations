import { DimensionValue, PivotFrame } from "./PivotFrame";
import { PivotProps } from "./types";
import { DataFrame } from "./DataFrame";

/**
 * This class exposes internal implementation of PivotFrame,
 * but it allows you to do optimisation in case you already have indexed prebuilt,
 * for example from the server response.
 * It means that the class can break without notice if we will change implementation,
 * TypeScript will complain though.
 */
export class PivotFramePreindexed<Name extends string = string> extends PivotFrame<Name> {
  constructor(
    origin: DataFrame<Name>,
    prop: PivotProps<Name, Name> & {
      rowHeadersInternal: DimensionValue[][];
      columnHeadersInternal: DimensionValue[][];
      columnIndex: number[][];
      rowIndex: number[][];
    },
  ) {
    const { rowHeadersInternal, columnHeadersInternal, columnIndex, rowIndex, ...rest } = prop;
    super(origin, rest);
    this.rowHeadersInternal = rowHeadersInternal;
    this.columnHeadersInternal = columnHeadersInternal;
    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
  }
}
