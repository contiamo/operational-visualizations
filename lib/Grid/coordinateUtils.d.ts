import { PivotFrame } from "../DataFrame/PivotFrame";
import { CellCoordinates, DimensionLabels, HeightParam, WidthParam } from "./types";
export declare const exhaustiveCheck: (_: never) => undefined;
export declare type IndexToCoordinate = <Name extends string = string>(prop: {
    rowHeadersCount: number;
    measuresPlacement: "row" | "column";
    columnHeadersCount: number;
    measuresCount: number;
    data: PivotFrame<Name>;
    axes: {
        row?: Function;
        column?: Function;
    };
    measures: Name[];
    dimensionLabels: DimensionLabels;
}) => (prop: {
    columnIndex: number;
    rowIndex: number;
}) => CellCoordinates<Name>;
/**
 * We use virtual scrolling in the Grid, so we need to be able to tell the size of each cell in the grid.
 * We decided to treat all type of cells as if they are in one big grid, including cells with headers, axes, measure names, values.
 * This function takes index coordinates in the "big grid" (x, y) and converts it to specific type of cells,
 * for example `{ type: Empty }`, `{ type: Cell }`... so we would be able to pattern match against type
 * and render appropriate cell or tell the dimension of the cell.
 * Cells are positioned this way in the "big grid":
 *```
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
export declare const indexToCoordinate: IndexToCoordinate;
export declare const coordinateToWidthParam: <Name extends string = string>(prop: CellCoordinates<Name>) => WidthParam<Name>;
export declare const coordinateToHeightParam: <Name extends string = string>(prop: CellCoordinates<Name>) => HeightParam<Name>;
/**
 * Get number of slots required to show row headers, including row labels, row values, measure labels and axis
 */
export declare const getRowHeadersCount: <Name extends string = string>({ axes, data, dimensionLabels, measuresPlacement, measuresCount, }: {
    axes: {
        row?: Function | undefined;
        column?: Function | undefined;
    };
    data: PivotFrame<Name>;
    dimensionLabels: DimensionLabels;
    measuresPlacement: "column" | "row";
    measuresCount: number;
}) => number;
/**
 * Get number of slots required to show column headers, including column labels, column values, measure labels and axis
 */
export declare const getColumnHeadersCount: <Name extends string = string>({ axes, data, dimensionLabels, measuresPlacement, measuresCount, }: {
    axes: {
        row?: Function | undefined;
        column?: Function | undefined;
    };
    data: PivotFrame<Name>;
    dimensionLabels: DimensionLabels;
    measuresPlacement: "column" | "row";
    measuresCount: number;
}) => number;
/**
 * Get total number of row slots required to show the grid e.g. number of headers + number of data cells
 * if we show measure labels in columns we need to increase number of data cell by number of measures
 */
export declare const getColumnCount: <Name extends string = string>({ rowHeadersCount, data, measuresPlacement, measuresCount, }: {
    data: PivotFrame<Name>;
    measuresPlacement: "column" | "row";
    measuresCount: number;
    rowHeadersCount: number;
}) => number;
/**
 * Get total number of column slots required to show the grid e.g. number of headers + number of data cells
 * if we show measure labels in rows we need to increase number of data cell by number of measures
 */
export declare const getRowCount: <Name extends string = string>({ columnHeadersCount, data, measuresPlacement, measuresCount, }: {
    data: PivotFrame<Name>;
    measuresPlacement: "column" | "row";
    measuresCount: number;
    columnHeadersCount: number;
}) => number;
//# sourceMappingURL=coordinateUtils.d.ts.map