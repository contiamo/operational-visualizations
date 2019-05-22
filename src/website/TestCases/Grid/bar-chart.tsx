import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";

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
    ["North America", "USA", "New York", "<50", "Female", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 801, 80.2],
  ],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

import { Axis } from "../../../ReactComponents/Axis";
import { Bars } from "../../../ReactComponents/Bars";
import { Chart } from "../../../ReactComponents/Chart";
import { useScaleBand, useScaleLinear } from "../../../ReactComponents/scale";

// Magic number
const margin = 60;

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const BarChart = React.memo(() => {
      const width = 300;
      const height = 300;
      const yScale = useScaleBand({ frame, column: "Customer.City", size: height });
      const xScale = useScaleLinear({ frame, size: width, column: "sales" });

      return (
        <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
          <Bars
            data={frame}
            xScale={xScale}
            yScale={yScale}
            x={frame.getCursor("sales")}
            y={frame.getCursor("Customer.City")}
            style={{ fill: "#1f78b4" }}
          />
          <Axis scale={xScale} direction="bottom" />
          <Axis scale={yScale} direction="left" />
        </Chart>
      );
    });
    ReactDOM.render(<BarChart />, container);
  });
};

export const title: string = "Stand-alone bar chart";

// Must match the file name so we can link to the code on GitHub
export const slug = "bar-chart";
