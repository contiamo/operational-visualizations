import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame } from "@operational/frame";
import {
  Area,
  AxialChartProps,
  Axis,
  Chart,
  ChartProps,
  useScaleBand,
  useScaleLinear
} from "@operational/visualizations";

const rawData = {
  columns: [
    {
      name: "Customer.Continent" as "Customer.Continent",
      type: "string"
    },
    {
      name: "Customer.Country" as "Customer.Country",
      type: "string"
    },
    {
      name: "Customer.City" as "Customer.City",
      type: "string"
    },
    {
      name: "Customer.AgeGroup" as "Customer.AgeGroup",
      type: "string"
    },
    {
      name: "Customer.Gender" as "Customer.Gender",
      type: "string"
    },
    {
      name: "sales" as "sales",
      type: "number"
    },
    {
      name: "revenue" as "revenue",
      type: "number"
    }
  ],
  rows: [
    ["Europe", "Germany", "Berlin", "<50", "Female", 101, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Female", 201, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 301, 30.2],
    ["Europe", "UK", "London", "<50", "Female", 401, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 501, 50.2],
    ["North America", "USA", "New York", "<50", "Female", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 801, 80.2]
  ]
};

const frame = new DataFrame(rawData.columns, rawData.rows);

interface LineChartProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  categorical: Name;
  metric: Name;
  metricDirection: AxialChartProps<string>["metricDirection"];
}

/**
 * Examples of how you can compose more complex charts out of 'atoms'
 */
const LineChart = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  metric,
  metricDirection
}: LineChartProps<Name>) => {
  const categoricalScale = useScaleBand({
    frame: data,
    column: data.getCursor(categorical),
    range: metricDirection === "vertical" ? [0, width] : [0, height]
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: data.getCursor(metric),
    range: metricDirection === "vertical" ? [height, 0] : [0, width]
  });

  return (
    <Chart
      width={width}
      height={height}
      margin={margin}
      style={{ background: "#fff" }}
    >
      <Area
        metricDirection={metricDirection}
        data={data}
        categorical={data.getCursor(categorical)}
        metric={data.getCursor(metric)}
        categoricalScale={categoricalScale}
        metricScale={metricScale}
        style={{ fill: "#1f78b4" }}
      />
      <Axis
        scale={categoricalScale}
        position={metricDirection === "vertical" ? "bottom" : "left"}
      />
      <Axis
        scale={metricScale}
        position={metricDirection === "vertical" ? "left" : "bottom"}
      />
    </Chart>
  );
};

storiesOf("@operational/visualizations/3. Area chart", module)
  .add("vertical", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <LineChart
        metric="sales"
        categorical="Customer.City"
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="vertical"
      />
    );
  })
  .add("horizonal", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <LineChart
        metric="sales"
        categorical="Customer.City"
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="horizontal"
      />
    );
  });
