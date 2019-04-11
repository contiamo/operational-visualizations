import React from "react";
import { AxisPosition } from "../Chart/typings";
import { DimensionWithPrimitiveAndMetadata, ReadonlyDataset } from "../data_handling/multidimensional_dataset";
import AxisBlock from "./axes/AxisBlock";
import CellBlock from "./cells/CellBlock";
import ColumnHeaderBlock from "./column_headers/ColumnHeaderBlock";
import RowHeaderBlock from "./row_headers/RowHeaderBlock";
import { Accessors, Axes } from "./types";

export interface Props<T = any> {
  data: ReadonlyDataset<T>;
  axes: Axes;
  accessors: Accessors;
  cell: (props: { cell: T; width: number; height: number }) => React.ReactNode;
}

// Helper functions
/** Total width of columns */
const columnsWidth = ({ data, accessors }: Props) =>
  data.columns().reduce((width, column) => width + accessors.columns.width(column), 0);

/** Total width of row headers */
const rowHeadersWidth = ({ data, accessors }: Props) =>
  data.rowDimensions().reduce((width, dimension) => width + rowHeaderWidth(accessors)(dimension), 0);

/** Width of individual row header for single dimension and its values */
const rowHeaderWidth = (accessors: Props["accessors"]) => (dimension: DimensionWithPrimitiveAndMetadata) => {
  const titleHeight = accessors.dimensionTitle.hide(dimension) ? 0 : accessors.dimensionTitle.lineHeight(dimension);
  return accessors.rowHeaders.orientation(dimension) === "horizontal"
    ? accessors.rowHeaders.columnWidths(dimension)
    : titleHeight + accessors.dimensionLabel.lineHeight(dimension);
};

/** Width of cell block */
const cellBlockWidth = ({ data, accessors }: Props) =>
  data.columns().reduce<number>((width, column) => width + accessors.columns.width(column), 0);

/** Width of set of axes, if defined */
const axesWidth = (axes: Axes, position: AxisPosition) => {
  const axisSet = axes[position];
  return axisSet ? Math.max(...axisSet.map(axis => axis.width)) : 0;
};

function Grid<T>(props: Props<T>) {
  const marginLeft = rowHeadersWidth(props) + axesWidth(props.axes, "y1");
  return (
    <div style={{ float: "left", width: marginLeft + cellBlockWidth(props) + axesWidth(props.axes, "y2") }}>
      <ColumnHeaderBlock
        width={columnsWidth(props)}
        accessors={props.accessors}
        marginLeft={marginLeft}
        dimensions={props.data.columnDimensions()}
        columns={props.data.columns()}
      />
      {props.axes.x2 && <AxisBlock axes={props.axes.x2} marginLeft={marginLeft} />}
      <RowHeaderBlock
        accessors={props.accessors}
        dimensions={props.data.rowDimensions()}
        rows={props.data.rows()}
        rowHeaderWidth={rowHeaderWidth(props.accessors)}
      />
      {props.axes.y1 && <AxisBlock axes={props.axes.y1} width={axesWidth(props.axes, "y1")} />}
      <CellBlock data={props.data} accessors={props.accessors} width={columnsWidth(props)} cell={props.cell} />
      {props.axes.y2 && (
        <AxisBlock axes={props.axes.y2} backgroundColor={"transparent"} width={axesWidth(props.axes, "y2")} />
      )}
      {props.axes.x1 && (
        <AxisBlock
          axes={props.axes.x1}
          backgroundColor={"transparent"}
          width={columnsWidth(props)}
          marginLeft={marginLeft}
        />
      )}
    </div>
  );
}

export default Grid;
