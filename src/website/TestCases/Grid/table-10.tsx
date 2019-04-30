import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";
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

import { VictoryAxis, VictoryBar, VictoryChart } from "victory";

import { scaleLinear } from "d3-scale";

const scale = scaleLinear()
  .domain([1000, 0])
  .range([0, 100]);

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const axes = {
      column: () => (
        <VictoryChart height={200} width={1000}>
          <VictoryAxis scale={scale} />
        </VictoryChart>
      ),
      row: ({ row }: any) => {
        const citiesSet = new Set<string>();
        pivotedFrame.row(row).forEach("Customer.City", x => citiesSet.add(x));
        const cities = [...citiesSet];
        return (
          <VictoryChart height={200} width={50}>
            <VictoryAxis dependentAxis tickValues={cities.map((_, i) => i + 1)} tickFormat={cities} />
          </VictoryChart>
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
            cellStyle={{ padding: "0px" }}
            accessors={{
              height: param => ("columnIndex" in param || ("measure" in param && param.measure === true) ? 35 : 100),
              width: param => ("rowIndex" in param || ("measure" in param && param.measure === true) ? 120 : 100),
            }}
            cell={({ data, measure }: any) => {
              const cell = data.toRecordList([measure, "Customer.City"]);
              return (
                // @ts-ignore
                <VictoryBar
                  horizontal={true}
                  barWidth={300}
                  style={{ data: { fill: "#c43a31" } }}
                  data={cell}
                  width={1000}
                  height={1000}
                  domain={{ y: [0, 1000] }}
                  domainPadding={{ x: 200 }}
                  range={{ y: [0, 1000] }}
                  scale={{ y: scale }}
                  y={measure}
                  x="Customer.City"
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

export const title: string = "New Grid with victory";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-10";
