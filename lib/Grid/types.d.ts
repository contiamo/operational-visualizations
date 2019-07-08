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
export declare type WidthParam<Name extends string = string> = {
    rowIndex: number;
} | {
    measure: true;
} | {
    axis: true;
} | {
    column: number;
    measure?: Name;
};
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
export declare type HeightParam<Name extends string = string> = {
    columnIndex: number;
} | {
    measure: true;
} | {
    axis: true;
} | {
    row: number;
    measure?: Name;
};
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
export declare type CellCoordinates<Name extends string = string> = {
    type: "Empty";
    columnIndex?: number;
    rowIndex?: number;
    measure?: "row" | "column";
    axis?: boolean;
    dimensionLabel?: Name | "";
} | {
    type: "Cell";
    measure?: Name;
    row: number;
    column: number;
} | {
    type: "RowHeader";
    row: number;
    rowIndex?: number;
    label?: string;
    measure?: Name;
    empty?: boolean;
} | {
    type: "ColumnHeader";
    column: number;
    columnIndex?: number;
    label?: string;
    measure?: Name;
    empty?: boolean;
} | {
    type: "RowAxis";
    row: number;
    measure?: Name;
} | {
    type: "ColumnAxis";
    column: number;
    measure?: Name;
};
export declare type DimensionLabels = {
    row: "top";
    column: "top";
} | {
    row: "left";
    column: "left";
} | {
    row: "none";
    column: "none";
} | {
    row: "left";
    column: "top";
} | {
    row: "top" | "left";
    column: "none";
} | {
    row: "none";
    column: "top" | "left";
};
//# sourceMappingURL=types.d.ts.map