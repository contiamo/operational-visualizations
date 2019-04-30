/*

                        Column
             +-------+ +-+
             |Columns| | | 0 ColumnIndex
             |       | | |
             |       | | | 1
             |       | | |
             |       | | | 2
             +-------+ +-+
             |Measure|
             +-------+
             |Axis   |
+--------------------+
|Rows    |M|A|Cells  |
|        | | |       |
|        | | |       |
|        | | |       |
|        | | |       |
|        | | |       |
|        | | |       |
+--------+-+-+-------+

+--------+
|        | Row
+--------+
 0 1 2 3   RowIndex

*/

export type WidthParam<Name extends string = string> =
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
      column: string[];
      measure?: Name;
    };

export type HeightParam<Name extends string = string> =
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
      row: string[];
      measure?: Name;
    };

export type CellCoordinates<Name extends string = string> =
  | {
      type: "Empty";
      columnIndex?: number;
      rowIndex?: number;
      measure?: "row" | "column";
      axis?: boolean;
    }
  | {
      type: "Cell";
      row: string[];
      column: string[];
      measure?: Name;
    }
  | {
      type: "RowHeader";
      row: string[];
      // either rowIndex or measure should be present
      rowIndex?: number;
      measure?: Name;
      empty?: boolean; // true if adjacent cell have the same value
    }
  | {
      type: "ColumnHeader";
      column: string[];
      // either columnIndex or measure should be present
      columnIndex?: number;
      measure?: Name;
      empty?: boolean; // true if adjacent cell have the same value
    }
  | {
      type: "RowAxis";
      row: string[]; // values of dimension
      measure?: Name;
    }
  | {
      type: "ColumnAxis";
      column: string[]; // values of dimension
      measure?: Name;
    };
