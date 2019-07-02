import { DataFrame } from "@operational/frame";
import { Axis, Bars, BarsProps, Chart, useScaleBand, useScaleLinear } from "@operational/visualizations";
import { storiesOf } from "@storybook/react";
import * as React from "react";

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

interface BarChartProps<Name extends string> {
  width: number;
  height: number;
  margin: number | [number, number] | [number, number, number, number];
  data: BarsProps["data"];
  dimension: Name;
  measure: Name;
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({ width, height, margin, data, dimension, measure }: BarChartProps<Name>) => {
  const dimensionScale = useScaleBand({ frame: data, column: dimension, range: [height, 0] });
  const measureScale = useScaleLinear({ frame: data, column: measure, range: [0, width] });

  return (
    <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
      <Bars
        direction={"horizontal"}
        data={data}
        dimension={dimension}
        measure={measure}
        dimensionScale={dimensionScale}
        measureScale={measureScale}
        style={{ fill: "#1f78b4" }}
      />
      <Axis scale={dimensionScale} position="left" />
      <Axis scale={measureScale} position="bottom" />
    </Chart>
  );
};

storiesOf("@operational/visualizations/1. Bar chart", module).add("horizontal", () => {
  // number of pixels picked manually to make sure that YAxis fits on the screen
  const magicMargin = [5, 10, 20, 60];

  return (
    <BarChart measure="sales" dimension="Customer.City" width={300} height={300} margin={magicMargin} data={frame} />
  );
});
