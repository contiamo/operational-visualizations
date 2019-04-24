import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../data_handling/DataFrame";
import MultidimensionalDataset from "../../../data_handling/multidimensional_dataset";
import Grid from "../../../Grid/Grid";
import defaultGridConfig from "../../../Grid/gridConfig";
import gridConfigToAccessors from "../../../Grid/gridConfigToAccessors";

const rawData = {
  columns: [
    {
      name: "Customer.Continent",
      type: "string",
    },
    {
      name: "Customer.Country",
      type: "string",
    },
    {
      name: "Customer.City",
      type: "string",
    },
    {
      name: "Customer.AgeGroup",
      type: "string",
    },
    {
      name: "Customer.Gender",
      type: "string",
    },
    {
      name: "sales",
      type: "number",
    },
    {
      name: "revenue",
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
    ["North America", "Canada", "Toronto", "<50", "Female", 901, 90.2],
    ["Europe", "Germany", "Berlin", "<50", "Male", 103, 10.4],
    ["Europe", "Germany", "Dresden", "<50", "Male", 203, 20.4],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 303, 30.4],
    ["Europe", "UK", "London", "<50", "Male", 403, 40.4],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 503, 50.4],
    ["Europe", "UK", "Dresden", "<50", "Male", 703, 70.4],
    ["North America", "USA", "New York", "<50", "Male", 803, 80.4],
    ["North America", "Canada", "Toronto", "<50", "Male", 903, 90.4],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 105, 10.6],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 205, 20.6],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 305, 30.6],
    ["Europe", "UK", "London", ">=50", "Female", 405, 40.6],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 505, 50.6],
    ["Europe", "UK", "Dresden", ">=50", "Female", 705, 70.6],
    ["North America", "USA", "New York", ">=50", "Female", 805, 80.6],
    ["North America", "Canada", "Toronto", ">=50", "Female", 905, 90.6],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 107, 10.8],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 207, 20.8],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 307, 30.8],
    ["Europe", "UK", "London", ">=50", "Male", 407, 40.8],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 507, 50.8],
    ["Europe", "UK", "Dresden", ">=50", "Male", 707, 70.8],
    ["North America", "USA", "New York", ">=50", "Male", 807, 80.8],
    ["North America", "Canada", "Toronto", ">=50", "Male", 907, 90.8],
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

const padding = 5;

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
    const data = new MultidimensionalDataset(
      frame
        .groupBy(
          ["Customer.Continent", "Customer.Country", "Customer.City", "Customer.AgeGroup", "Customer.Gender"],
          "newCol",
        )
        .transform("newCol", (x: DataFrame) => x.toRecordList())
        .mdd({
          rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
          columns: ["Customer.AgeGroup", "Customer.Gender"],
          columnsMeasures: ["newCol"],
        }),
    );

    const accessors = gridConfigToAccessors({
      ...defaultGridConfig,
      ...{
        columns: {
          width: 100 + padding * 2,
        },
        rows: {
          height: 100 + padding * 2,
        },
      },
    });

    // ugliest implementation full of magic numbers
    const axisWidth = 45;
    const y1Axis = {
      margins: ``,
      width: axisWidth,
      draw: (i: number) => (
        <svg
          key={i}
          width={axisWidth}
          height={100 + padding * 2}
          viewBox={`-25 -${padding} ${axisWidth - 25} ${100 + 2 * padding}`}
          style={{ overflow: "hidden", marginBottom: "-3px" }}
        >
          <Axis
            size={[axisWidth, 100]}
            ticks={4}
            scale={scaleLinear()
              .domain([max, 0])
              .range([0, 100])}
            orient="left"
          />
        </svg>
      ),
    };
    const axes = {
      y1: Array.from({ length: 8 }).map(_ => y1Axis),
    };

    ReactDOM.render(
      <div style={{ display: "inline-block" }}>
        <Grid
          data={data}
          axes={axes}
          accessors={accessors}
          cell={({ cell, width, height }) => (
            <OrdinalFrame
              {...frameProps}
              data={cell}
              size={[width, height]}
              rAccessor={Object.keys((cell as any)[0])}
            />
          )}
        />
      </div>,
      container,
    );
  });
};

export const title: string = "Cell render prop with new DataFrame";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-5";
