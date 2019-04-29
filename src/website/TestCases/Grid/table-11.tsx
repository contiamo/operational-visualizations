import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../data_handling/DataFrame";
import { NewGrid } from "../../../NewGrid/NewGrid";

import AutoSizer from "react-virtualized-auto-sizer";

const rawData = {
  columns: [
    {
      name: "Customer.Continent" as "Customer.Continent",
      type: "string",
    },
    {
      name: "Customer.Country" as "Customer.Country",
      type: "string",
    },
    {
      name: "Customer.City" as "Customer.City",
      type: "string",
    },
    {
      name: "Customer.AgeGroup" as "Customer.AgeGroup",
      type: "string",
    },
    {
      name: "Customer.Gender" as "Customer.Gender",
      type: "string",
    },
    {
      name: "sales" as "sales",
      type: "number",
    },
    {
      name: "revenue" as "revenue",
      type: "number",
    },
  ],
  rows: [
    ["Europe", "Germany", "Berlin", "<50", "Female", 101, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Female", 201, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 301, 30.2],
    ["Europe", "UK", "London", "<50", "Female", 401, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 501, 50.2],
    ["Europe", "UK", "Dresden", "<50", "Female", 701, 70.2],
    ["North America", "USA", "New York", "<50", "Female", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 801, 80.2],
    ["Europe", "Germany", "Berlin", "<50", "Male", 103, 10.4],
    ["Europe", "Germany", "Dresden", "<50", "Male", 203, 20.4],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 303, 30.4],
    ["Europe", "UK", "London", "<50", "Male", 403, 40.4],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 503, 50.4],
    ["Europe", "UK", "Dresden", "<50", "Male", 703, 70.4],
    ["North America", "USA", "New York", "<50", "Male", 803, 80.4],
    ["North America", "Canada", "Toronto", "<50", "Male", 803, 80.4],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 105, 10.6],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 205, 20.6],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 305, 30.6],
    ["Europe", "UK", "London", ">=50", "Female", 405, 40.6],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 505, 50.6],
    ["Europe", "UK", "Dresden", ">=50", "Female", 705, 70.6],
    ["North America", "USA", "New York", ">=50", "Female", 805, 80.6],
    ["North America", "Canada", "Toronto", ">=50", "Female", 805, 80.6],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 107, 10.8],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 207, 20.8],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 307, 30.8],
    ["Europe", "UK", "London", ">=50", "Male", 407, 40.8],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 507, 50.8],
    ["Europe", "UK", "Dresden", ">=50", "Male", 707, 70.8],
    ["North America", "USA", "New York", ">=50", "Male", 807, 80.8],
    ["North America", "Canada", "Toronto", ">=50", "Male", 807, 80.8],
  ],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

import { Accessors, ChartConfig, Data } from "../../../Chart/typings";
import { Chart as ChartFacade, VisualizationWrapper } from "../../../index";

const Chart: React.FC<{
  data: Data;
  config?: ChartConfig;
  accessors?: Record<string, Accessors<any>>;
}> = React.memo(({ data, accessors, config }) => (
  <VisualizationWrapper facade={ChartFacade} data={data} accessors={accessors} config={config} />
));

import * as d3 from "d3";
import { PivotFrame } from "../../../data_handling/PivotFrame";

const Axis: React.FC<{ orientation?: "left"; scale: any; transform: string }> = React.memo(({ scale, transform }) => {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (ref.current) {
      const axis = d3.axisLeft(scale);
      d3.select(ref.current).call(axis);
    }
  }, [ref, scale]);
  return <g transform={transform} ref={ref} />;
});

const uniqueValues = <Name extends string>(row: string[], column: Name, pivotedFrame: PivotFrame<Name>): string[] => {
  const set = new Set<string>();
  pivotedFrame.row(row).forEach(column, x => set.add(x));
  return [...set];
};

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const axes = {
      row: (row: string[]) => {
        const cities = uniqueValues(row, "Customer.City", pivotedFrame);
        const scale = d3
          .scaleOrdinal()
          .domain(cities)
          .range(cities.map((_, i) => (cities.length - 1 - i) * 35 + 15));
        return (
          <svg width={100} height={85} viewBox="0 0 100 100" style={{ marginTop: 15 }}>
            <Axis scale={scale} transform={"translate(90, 0)"} />
          </svg>
        );
      },
    };

    ReactDOM.render(
      <AutoSizer style={{ width: "100%", minHeight: "450px", height: "100%" }}>
        {({ width, height }) => (
          <NewGrid
            measures={["sales", "revenue"]}
            width={width}
            height={height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                // if ("row" in param) {
                //   const cities = uniqueValues(param.row, "Customer.City", pivotedFrame);
                //   return cities.length * 30 + 15;
                // }
                return "columnIndex" in param || ("measure" in param && param.measure === true) ? 35 : 100;
              },
              width: param => ("rowIndex" in param || ("measure" in param && param.measure === true) ? 120 : 100),
            }}
            cell={({ data, measure, row }: any) => {
              // const cell = data.toRecordListMap({ [measure]: "x", "Customer.City": "y" });
              const cell = data.toRecordList([measure, "Customer.City"]);
              const cities = uniqueValues(row, "Customer.City", pivotedFrame);
              return (
                <Chart
                  config={
                    {
                      width: 100,
                      height: 100,
                      legend: false,
                    } as any
                  }
                  data={{
                    series: [
                      {
                        data: cell,
                        name: "",
                        key: "series1",
                        renderAs: [{ type: "bars", accessors: { barWidth: () => 18 } }],
                        datumAccessors: { x: (r: any) => r[measure], y: (r: any) => r["Customer.City"] },
                      },
                    ],
                    axes: {
                      x1: {
                        type: "quant",
                        hideAxis: true,
                      },
                      y1: {
                        type: "categorical",
                        values: cities,
                        hideAxis: true,
                      } as any,
                    },
                  }}
                />
              );
            }}
          />
        )}
      </AutoSizer>,
      container,
    );
  });
};

export const title: string = "New Grid with @operational/visualizations";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-11";
