import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";
import { PivotGrid } from "../../../Grid/PivotGrid";

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

import { getCategoricalStats } from "../../../DataFrame/stats";
import { Axis } from "../../../ReactComponents/Axis";
import { Bars, useScaleBand, useScaleLinear } from "../../../ReactComponents/Bars";

const padding = 5;
const barWidth = 30; // (cellHeight - padding * 2) / maxNumberOfBars;

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const axes = {
      row: ({ row, width, height }: { row: number; width: number; height: number }) => {
        const h = height - 2 * padding;
        const yScale = useScaleBand({ data: pivotedFrame.row(row), column: "Customer.City", size: height });
        return (
          <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ margin: `${padding} 0` }}>
            <Axis scale={yScale} transform={`translate(${width}, -${padding})`} />
          </svg>
        );
      },
    };

    ReactDOM.render(
      <AutoSizer style={{ width: "100%", minHeight: "450px", height: "100%" }}>
        {size => (
          <PivotGrid
            measures={["sales", "revenue"]}
            width={size.width}
            height={size.height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                if ("row" in param) {
                  const cities = getCategoricalStats(pivotedFrame.row(param.row)).unqiue["Customer.City"];
                  return cities.length * barWidth + padding * 2;
                }
                return "columnIndex" in param || ("measure" in param && param.measure === true) ? 35 : 100;
              },
              width: param => ("rowIndex" in param || ("measure" in param && param.measure === true) ? 120 : 100),
            }}
            cell={({ data, row, width, height, measure }: any) => {
              const w = width - 2 * padding;
              const h = height - 2 * padding;
              const yScale = useScaleBand({ data: pivotedFrame.row(row), column: "Customer.City", size: h });
              const xScale = useScaleLinear({ data: frame, size: w, column: "sales" });
              return (
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ margin: padding }}>
                  <Bars
                    data={data}
                    xScale={xScale}
                    yScale={yScale}
                    x={frame.getAccessor(measure)}
                    y={frame.getAccessor("Customer.City")}
                    style={{ fill: "#1f78b4" }}
                  />
                </svg>
              );
            }}
          />
        )}
      </AutoSizer>,
      container,
    );
  });
};

export const title: string = "New Grid with visualizations";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-2";
