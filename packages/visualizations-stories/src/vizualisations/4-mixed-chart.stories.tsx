import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame } from "@operational/frame";
import {
  Area,
  Axis,
  Chart,
  ChartProps,
  Line,
  useScaleBand,
  useScaleLinear,
  Bars,
  Labels,
} from "@operational/visualizations";

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

interface MixedChartProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  categorical: Name;
  metric: Name;
  metricDirection: "horizontal" | "vertical";
}

/**
 * Examples of how you can compose more complex charts out of 'atoms'
 */
const MixedChart = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  metric,
  metricDirection,
}: MixedChartProps<Name>) => {
  const categoricalScale = useScaleBand({
    frame: data,
    column: data.getCursor(categorical),
    range: metricDirection === "vertical" ? [0, width] : [0, height],
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: data.getCursor(metric),
    range: metricDirection === "vertical" ? [height, 0] : [0, width],
  });
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);

  return (
    <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
      <Area
        data={data}
        x={metricDirection === "vertical" ? categoricalCursor : metricCursor}
        y={metricDirection === "vertical" ? metricCursor : categoricalCursor}
        xScale={metricDirection === "vertical" ? categoricalScale : metricScale}
        yScale={metricDirection === "vertical" ? metricScale : categoricalScale}
        style={{ fill: "#ddd" }}
      />
      {data.groupBy([categoricalCursor]).map((grouped, i) => (
        <Bars
          key={i}
          data={grouped}
          x={metricDirection === "vertical" ? categoricalCursor : metricCursor}
          y={metricDirection === "vertical" ? metricCursor : categoricalCursor}
          xScale={metricDirection === "vertical" ? categoricalScale : metricScale}
          yScale={metricDirection === "vertical" ? metricScale : categoricalScale}
          style={{ fill: "#1499CE" }}
        />
      ))}
      <Line
        data={data}
        x={metricDirection === "vertical" ? categoricalCursor : metricCursor}
        y={metricDirection === "vertical" ? metricCursor : categoricalCursor}
        xScale={metricDirection === "vertical" ? categoricalScale : metricScale}
        yScale={metricDirection === "vertical" ? metricScale : categoricalScale}
        style={{ stroke: "#7C246F" }}
      />
      <Labels
        data={data}
        x={metricDirection === "vertical" ? categoricalCursor : metricCursor}
        y={metricDirection === "vertical" ? metricCursor : categoricalCursor}
        xScale={metricDirection === "vertical" ? categoricalScale : metricScale}
        yScale={metricDirection === "vertical" ? metricScale : categoricalScale}
      />
      <Axis scale={categoricalScale} position={metricDirection === "vertical" ? "bottom" : "left"} />
      <Axis scale={metricScale} position={metricDirection === "vertical" ? "left" : "bottom"} />
    </Chart>
  );
};

storiesOf("@operational/visualizations/4. Mixed chart", module)
  .add("vertical", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;

    return (
      <MixedChart
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
      <MixedChart
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
