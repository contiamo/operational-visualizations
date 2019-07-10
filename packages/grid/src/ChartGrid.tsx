import { DataFrame, FragmentFrame, PivotFrame, uniqueValues } from "@operational/frame";
import { PivotGrid } from ".";
import { Axis, useScaleBand, useScaleLinear } from "@operational/visualizations";
import React, { ReactNode } from "react";

// TODO Move to @operational/grid
interface ChartGridProps<Name extends string> {
  width: number;
  height: number;
  data: DataFrame<string>;
  query: { rows: Name[], columns: Name[] };
  renderer: any;
  measuresInRow: boolean;
  measures: Name[];
}

interface CellProps<Name extends string> {
  data: FragmentFrame<Name>;
  width: number;
  height: number;
  row: number;
  column: number;
  measure: Name;
}

const tickWidth = 25;
const defaultCellSize = 200;

const axes = (data: DataFrame<string>, pivotedFrame: PivotFrame<string>, categorical: string) => {
  return {
    row: ({row, measure, width, height}: {row: number, measure?: string, width: number, height: number}) => {
      const scale = !!measure
        ? useScaleLinear({
          frame: data,
          column: measure,
          range: [height, 0]
        })
        : useScaleBand({
          frame: pivotedFrame.row(row),
          column: categorical,
          range: [height, 0]
        })
      return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Axis scale={scale} position="left" transform={`translate(${width}, 0)`}/>
      </svg>
    },
    // TODO Re-implement once tick spacing or another way of displaying labels without overlap has been implemented
    column: ({column, measure, width, height}: {column: number, measure?: string, width: number, height: number}) => {
      const scale = !!measure
        ? useScaleLinear({
          frame: data,
          column: measure,
          range: [0, width],
        })
        : useScaleBand({
          frame: pivotedFrame.column(column),
          column: categorical,
          range: [0, width],
        })
      return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Axis scale={scale} position="top" transform={`translate(0, ${height})`}/>
      </svg>
    }
  }
}

// TODO replace Renderer type once @operational/visualizations has a general interface for chart renderers
const cell = (dataFrame: DataFrame<string>, categorical: string, measuresInRow: boolean, Renderer: any) => {
  return ({ data, width, height, measure }: CellProps<string>): ReactNode => {
    const categoricalScale = useScaleBand({
      frame: data,
      column: categorical,
      range: measuresInRow ? [0, width] : [height, 0]
    });
    const metricScale = useScaleLinear({
      frame: dataFrame,
      column: measure,
      range: measuresInRow ? [height, 0] : [0, width]
    });
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Renderer
          direction={measuresInRow ? "vertical" : "horizontal"}
          data={data}
          metricScale={metricScale}
          categoricalScale={categoricalScale}
          metric={dataFrame.getCursor(measure)}
          categorical={dataFrame.getCursor(categorical)}
          style={{ fill: "#1f78b4" }}
        />
      </svg>
    );
  }
}

export const ChartGrid = ({ width, height, data, query, measuresInRow, measures, renderer: Renderer }: ChartGridProps<string>) => {
  const rows = query.rows.slice(0, -(measuresInRow ? measures.length : 1))
  const columns = query.columns.slice(0, -(measuresInRow ? 1 : measures.length))
  const pivotedFrame = data.pivot({ rows, columns })
  const categorical = measuresInRow ? query.columns[query.columns.length - 1] : query.rows[query.rows.length - 1];

  return <PivotGrid
    type="generalWithMeasures"
    measures={measures}
    measuresPlacement={measuresInRow ? "row" : "column"}
    width={width}
    height={height}
    data={pivotedFrame}
    axes={axes(data, pivotedFrame, categorical)}
    accessors={{
      height: param => {
        if (!measuresInRow && "row" in param) {
          return uniqueValues(pivotedFrame.row(param.row), query.rows[query.rows.length - 1]).length * tickWidth
        }
        if ("axis" in param && param.axis === true) {
          return 30
        }
        return "columnIndex" in param || ("measure" in param && param.measure === true)
          ? 35
          : defaultCellSize
      },
      width: param => {
        if (measuresInRow && "column" in param) {
          return uniqueValues(pivotedFrame.column(param.column), query.columns[query.columns.length - 1]).length * tickWidth
        }
        if ("axis" in param && param.axis === true) {
          return measuresInRow ? 50 : 150
        }
        return "rowIndex" in param || ("measure" in param && param.measure === true)
          ? 120
          : defaultCellSize
      }
    }}
    cell={cell(data, categorical, measuresInRow, Renderer)}
  />
};
