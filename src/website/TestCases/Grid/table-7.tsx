import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../data_handling/DataFrame";
import { NewGrid } from "../../../NewGrid/NewGrid";

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

import { getQuantitiveStats } from "./../../../data_handling/stats";

const stats = getQuantitiveStats(frame);
const max: number = Math.max(stats.max.revenue, stats.max.sales);
const range = [0, max!];

// @ts-ignore
import OrdinalFrame from "semiotic/lib/OrdinalFrame";

const color = ["#ac58e5", "#9fd0cb", "#E0488B"];

const padding = 0;

const frameProps = {
  type: "clusterbar",
  rExtent: range,
  // using simplified color assigner function, instead it should be consistent across the graphs
  style: ({ rIndex }: { rIndex: number; rName: string }) => ({ fill: color[rIndex], stroke: "white" }),
  margin: { left: padding, bottom: padding, right: padding, top: padding },
};

import { scaleLinear } from "d3-scale";
// @ts-ignore
import { Axis } from "semiotic";

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    // ugliest implementation full of magic numbers
    const axisWidth = 45;
    const y1Axis = () => (
      <svg
        width={axisWidth}
        height={80}
        viewBox={`-25 -${padding} ${axisWidth - 25} ${80}`}
        style={{ overflow: "hidden", marginBottom: "-3px" }}
      >
        <Axis
          size={[axisWidth, 80]}
          ticks={4}
          scale={scaleLinear()
            .domain([max, 0])
            .range([0, 80])}
          orient="left"
        />
      </svg>
    );
    const axes = {
      row: y1Axis,
    };

    ReactDOM.render(
      <div style={{ display: "inline-block" }}>
        <NewGrid
          width={500}
          height={500}
          axes={axes}
          data={pivotedFrame}
          cellStyle={{ padding: "10px" }}
          cell={({ data }: any) => {
            const width = 80,
              height = 80;
            const cell = data.toRecordList();
            return (
              <OrdinalFrame
                {...frameProps}
                data={cell}
                size={[width, height]}
                rAccessor={Object.keys((cell as any)[0])}
              />
            );
          }}
        />
      </div>,
      container,
    );
  });
};

export const title: string = "New Grid with chart";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-7";
