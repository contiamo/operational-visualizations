import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame } from "@operational/frame";
import {
  Axis,
  Line,
  Chart,
  useScaleBand,
  useScaleLinear,
  LineProps
} from "@operational/visualizations";
import { ChartProps } from "@operational/visualizations/lib/Chart";

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
  monotoneDirection: LineProps["monotoneDirection"];
}

interface MultipleLinesProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  categorical: Name;
  metrics: Name[];
  monotoneDirection: LineProps["monotoneDirection"];
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
  monotoneDirection
}: LineChartProps<Name>) => {
  const categoricalScale = useScaleBand({
    frame: data,
    column: categorical,
    range: monotoneDirection === "horizontal" ? [0, width] : [0, height]
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metric,
    range: monotoneDirection === "horizontal" ? [height, 0] : [0, width]
  });

  return (
    <Chart
      width={width}
      height={height}
      margin={margin}
      style={{ background: "#fff" }}
    >
      <Line
        monotoneDirection={monotoneDirection}
        data={data}
        categorical={data.getCursor(categorical)}
        metric={data.getCursor(metric)}
        categoricalScale={categoricalScale}
        metricScale={metricScale}
        style={{ stroke: "#1f78b4" }}
      />
      <Axis
        scale={categoricalScale}
        position={monotoneDirection === "horizontal" ? "bottom" : "left"}
      />
      <Axis
        scale={metricScale}
        position={monotoneDirection === "horizontal" ? "left" : "bottom"}
      />
    </Chart>
  );
};

const colors = [
  "#1499CE",
  "#7C246F",
  "#EAD63F",
  "#343972",
  "#ED5B17",
  "#009691",
  "#1D6199",
  "#D31F1F",
  "#AD329C",
  "#006865"
];

const MultipleLines = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  metrics,
  monotoneDirection
}: MultipleLinesProps<Name>) => {
  const categoricalScale = useScaleBand({
    frame: data,
    column: categorical,
    range: monotoneDirection === "horizontal" ? [0, width] : [0, height]
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metrics[0],
    range: monotoneDirection === "horizontal" ? [height, 0] : [0, width]
  });

  return (
    <Chart
      width={width}
      height={height}
      margin={margin}
      style={{ background: "#fff" }}
    >
      {metrics.map((metric, i) => (
        <Line
          monotoneDirection={monotoneDirection}
          data={data}
          categorical={data.getCursor(categorical)}
          metric={data.getCursor(metric)}
          categoricalScale={categoricalScale}
          metricScale={metricScale}
          style={{ stroke: colors[i] }}
        />
      ))}
      <Axis
        scale={categoricalScale}
        position={monotoneDirection === "horizontal" ? "bottom" : "left"}
      />
      <Axis
        scale={metricScale}
        position={monotoneDirection === "horizontal" ? "left" : "bottom"}
      />
    </Chart>
  );
};

storiesOf("@operational/visualizations/2. Line chart", module)
  .add("horizontal", () => {
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
        monotoneDirection="horizontal"
      />
    );
  })
  .add("vertical", () => {
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
        monotoneDirection="vertical"
      />
    );
  })
  .add("horizontal, multiple lines", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <MultipleLines
        metrics={["sales", "revenue"]}
        categorical="Customer.City"
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        monotoneDirection="horizontal"
      />
    );
  });
