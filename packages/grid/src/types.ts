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
      rowIndex: number;
    }
  | {
      // width of a measure column
      measure: true;
    }
  | {
      // width of an axis column
      axis: true;
    }
  | {
      // width of a column header or a data cell
      column: number;
      measure?: Name;
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
      columnIndex: number;
    }
  | {
      // height of a measure column
      measure: true;
    }
  | {
      // height of an axis column
      axis: true;
    }
  | {
      // height of a row header or a data cell
      row: number;
      measure?: Name;
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
  */
export type CellCoordinates<Name extends string = string> =
  // tslint:enable
  | {
      type: "Empty";
      columnIndex?: number;
      rowIndex?: number;
      measure?: "column" | "row";
      axis?: boolean;
      dimensionLabel?: Name | ""; // empty string is for empty cell
    }
  | {
      type: "Cell";
      measure?: Name;
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
