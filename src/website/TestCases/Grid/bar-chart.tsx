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

interface BarChartProps<Name extends string> {
  width: number;
  height: number;
  margin: number;
  data: DataFrame<Name>;
  XColumn: Name;
  YColumn: Name;
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({ width, height, margin, data, XColumn, YColumn }: BarChartProps<Name>) => {
  const yScale = useScaleBand({ frame: data, column: YColumn, size: height });
  const xScale = useScaleLinear({ frame: data, column: XColumn, size: width });

  // magic numbers
  yScale.paddingInner(0.4);
  yScale.paddingOuter(0.2);

  return (
    <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
      <Bars
        data={data}
        xScale={xScale}
        yScale={yScale}
        x={data.getCursor(XColumn)}
        y={data.getCursor(YColumn)}
        style={{ fill: "#1f78b4" }}
      />
      <Axis scale={xScale} direction="bottom" />
      <Axis scale={yScale} direction="left" />
    </Chart>
  );
};

// number of pixels picked manually to make sure that YAxis fits on the screen
const magicMargin = 60;

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    ReactDOM.render(
      <BarChart XColumn="sales" YColumn="Customer.City" width={300} height={300} margin={magicMargin} data={frame} />,
      container,
    );
  });
};

export const title: string = "Stand-alone bar chart";

// Must match the file name so we can link to the code on GitHub
export const slug = "bar-chart";
