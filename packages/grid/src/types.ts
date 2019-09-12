import { PivotFrame } from "@operational/frame";

// tslint:disable
/**
 * ```
          {measure}+--+ +--+{axis}
                      | |
{rowIndex}+------+    | |    +-----+{column, measure}
                 v    v v    v
            +----+---++++----+---+
            |        | | |Columns|
            |        | | |       |
            |        | | +-------+
            |        | | |Measure|
            |        | | +-------+
            |        | | |Axis   |
            +--------------------+
            |Rows    |M|A|Cells  |
            |        | | |       |
            +--------+-+-+-------+
```
  * `rowIndex` - when we create `PivotFrame`, we provide `rows` for index, like ["A", "B", "C"]; rowIndex corresponds to this config - `rowIndex` 0 is for "A", `rowIndex` 1 is for "B" etc.
  */
export type WidthParam<Name extends string = string> =
  // tslint:enable
  | {
      // width of an empty cell or a row header
      // this can be row (dimension) name as well
      type: "RowHeader";
      rowIndex: number;
    }
  | {
      // width of a measure column
      type: "RowMeasure";
    }
  | {
      // width of an axis column
      type: "RowAxis";
    }
  | {
      // width of a column header or a data cell
      type: "Cell";
      column: number;
      columnMeasure?: Name;
      rowMeasure?: Name;
    };

// tslint:disable
/**
 * ```
               +--------------------+
{columnIndex}  |            |Columns|
               |            |       |
               +--------------------+
{measure}+---->+            |Measure|
               +--------------------+
{axis}+------->+            |Axis   |
               +--------------------+
{row, measure} |Rows    |M|A|Cells  |
               |        | | |       |
               +--------+-+-+-------+
```
 *
 * `columnIndex` - when we create `PivotFrame`, we provide `columns` for index, like ["X", "Y", "Z"]; columnIndex corresponds to this config - `columnIndex` 0 is for "X", `columnIndex` 1 is for "Y" etc.
 */
export type HeightParam<Name extends string = string> =
  // tslint:enable
  | {
      // height of an empty cell or a column header
      // this can be column (dimension) name as well
      type: "ColumnHeader";
      columnIndex: number;
    }
  | {
      // height of a measure column
      type: "ColumnMeasure";
    }
  | {
      // height of an axis column
      type: "ColumnAxis";
    }
  | {
      // height of a row header or a data cell
      type: "Cell";
      row: number;
      columnMeasure?: Name;
      rowMeasure?: Name;
    };

// tslint:disable
/**
 * ```
                                  ColumnHeader
                                   +
          +--------------------+   |
Empty --->+            |Columns+<--+
          |            |       |   |
          |            |       |   |
          |            |       |   |
          |            |       |   |
          |            +-------+   |
          |            |Measure+<--+
          |            +-------+
          |            |Axis   +<--+ColumnAxis
          +--------------------+
          |Rows    |M|A|Cells  +<--+Cell
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          |        | | |       |
          ++-------+++++-------+
           ^        ^ ^
           |        | |
RowHeader -+--------+ |
                      |
RowAxis --------------+
```

TODO: rethink CellCoordinates. Maybe we can remove it in favour of WidthParam & HeightParam
  */
export type CellCoordinates<Name extends string = string> =
  // tslint:enable
  | {
      type: "Empty";
      columnIndex?: number;
      rowIndex?: number;
      measure?: boolean; // do we need this one?
      axis?: boolean;
      dimensionLabel?: Name | ""; // empty string is for empty cell
    }
  | {
      type: "Cell";
      rowMeasure?: Name;
      columnMeasure?: Name;
      row: number;
      column: number;
    }
  | {
      type: "RowHeader";
      row: number;
      // either label or measure should be present
      rowIndex?: number;
      label?: string;
      measure?: Name;
      empty?: boolean; // true if adjacent cell have the same value
    }
  | {
      type: "ColumnHeader";
      column: number;
      // either label or measure should be present
      columnIndex?: number;
      label?: string;
      measure?: Name;
      empty?: boolean; // true if adjacent cell have the same value
    }
  | {
      type: "RowAxis";
      row: number;
      measure?: Name;
    }
  | {
      type: "ColumnAxis";
      column: number;
      measure?: Name;
    };

export type DimensionLabels =
  | { row: "top"; column: "top" } // "top"
  | { row: "left"; column: "left" } // "left"
  | { row: "none"; column: "none" } // "none"
  | { row: "left"; column: "top" }
  | { row: "top" | "left"; column: "none" }
  | { row: "none"; column: "top" | "left" };

export interface CellPropsWithoutMeasure<Name extends string = string> {
  data: PivotFrame<Name>;
  width: number;
  height: number;
  row: number;
  column: number;
}

export type CellPropsWithMeasure<Name extends string = string> = {
  data: PivotFrame<Name>;
  width: number;
  height: number;
  row: number;
  column: number;
} & (
  | {
      rowMeasure: Name;
      columnMeasure: never;
    }
  | {
      rowMeasure: never;
      columnMeasure: Name;
    }
  | {
      rowMeasure: Name;
      columnMeasure: Name;
    });

export type CellProps<Name extends string = string> = CellPropsWithoutMeasure<Name> | CellPropsWithMeasure<Name>;

export type WidthProps<Name extends string = string> = WidthParam<Name> & { data: PivotFrame<Name> };
export type WidthAccessor<Name extends string = string> = (p: WidthProps<Name>) => number;

export type HeightProps<Name extends string = string> = HeightParam<Name> & { data: PivotFrame<Name> };
export type HeightAccessor<Name extends string = string> = (p: HeightProps<Name>) => number;

export interface RowProps<Name extends string = string> {
  data: PivotFrame<Name>;
  width: number;
  height: number;
  row: number;
  measure?: Name;
}

export interface ColumnProps<Name extends string = string> {
  data: PivotFrame<Name>;
  width: number;
  height: number;
  column: number;
  measure?: Name;
}
