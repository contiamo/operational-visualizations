import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame, RowCursor } from "@operational/frame";
import {
  AxialChartProps,
  Axis,
  Chart,
  ChartProps,
  Line,
  useScaleBand,
  useScaleLinear,
  Legend,
  useColorScale,
} from "@operational/visualizations";

const rawDataSingleLine = {
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
      name: "sales" as "sales",
      type: "number",
    },
  ],
  rows: [
    ["Europe", "Germany", "Berlin", 101],
    ["Europe", "Germany", "Dresden", 201],
    ["Europe", "Germany", "Hamburg", 301],
    ["Europe", "UK", "London", 401],
    ["Europe", "UK", "Edinburgh", 501],
    ["North America", "USA", "New York", 801],
    ["North America", "Canada", "Toronto", 801],
  ],
};

const rawDataMultipleLines = {
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
    ["Europe", "Germany", "Berlin", "<50", "Female", 181],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 18],
    ["Europe", "Germany", "Berlin", "<50", "Male", 101],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 10],
    ["Europe", "Germany", "Dresden", "<50", "Female", 281],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 28],
    ["Europe", "Germany", "Dresden", "<50", "Male", 201],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 20],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 381],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 38],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 301],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 30],
    ["Europe", "UK", "London", "<50", "Female", 481],
    ["Europe", "UK", "London", ">=50", "Female", 48],
    ["Europe", "UK", "London", "<50", "Male", 401],
    ["Europe", "UK", "London", ">=50", "Male", 40],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 581],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 58],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 501],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 50],
    ["North America", "USA", "New York", "<50", "Female", 881],
    ["North America", "USA", "New York", ">=50", "Female", 88],
    ["North America", "USA", "New York", "<50", "Male", 801],
    ["North America", "USA", "New York", ">=50", "Male", 80],
    ["North America", "Canada", "Toronto", "<50", "Female", 881],
    ["North America", "Canada", "Toronto", ">=50", "Female", 88],
    ["North America", "Canada", "Toronto", "<50", "Male", 801],
    ["North America", "Canada", "Toronto", ">=50", "Male", 80],
  ],
};

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
  metricDirection,
}: LineChartProps<Name>) => {
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

  const colorScale = useColorScale(data, []);

  return (
    <div style={{ display: "inline-block" }}>
      <Legend data={data} colorScale={colorScale} cursors={[]}/>
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        <Line
          metricDirection={metricDirection}
          data={data}
          categorical={categoricalCursor}
          metric={metricCursor}
          categoricalScale={categoricalScale}
          metricScale={metricScale}
          style={{ stroke: "#1f78b4" }}
        />
        <Axis scale={categoricalScale} position={metricDirection === "vertical" ? "bottom" : "left"} />
        <Axis scale={metricScale} position={metricDirection === "vertical" ? "left" : "bottom"} />
      </Chart>
    </div>
  );
};

type MultipleLinesProps<Name extends string> = LineChartProps<Name> & {
  series: Name[];
  colorBy: Name[];
};

const MultipleLines = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  series,
  metric,
  metricDirection,
  colorBy,
}: MultipleLinesProps<Name>) => {
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);

  const categoricalScale = useScaleBand({
    frame: data,
    column: categoricalCursor,
    range: metricDirection === "vertical" ? [0, width] : [0, height],
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metricCursor,
    range: metricDirection === "vertical" ? [height, 0] : [0, width],
  });

  const colorCursors = (colorBy || []).map(c => data.getCursor(c))
  const colorScale = useColorScale(data, colorCursors);

  return (
    <div style={{ display: "inline-block" }}>
      <Legend data={data} colorScale={colorScale} cursors={colorCursors}/>
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        {data.groupBy(series).map((seriesData, i) => (
          <Line
            key={i}
            metricDirection={metricDirection}
            data={seriesData}
            categorical={categoricalCursor}
            metric={metricCursor}
            categoricalScale={categoricalScale}
            metricScale={metricScale}
            style={(row: RowCursor) => ({ stroke: colorScale(row), strokeWidth: 2 })}
          />
        ))}
        <Axis scale={categoricalScale} position={metricDirection === "vertical" ? "bottom" : "left"} />
        <Axis scale={metricScale} position={metricDirection === "vertical" ? "left" : "bottom"} />
      </Chart>
    </div>
  );
};

const singleFrame = new DataFrame(rawDataSingleLine.columns, rawDataSingleLine.rows);
const multiplesFrame = new DataFrame(rawDataMultipleLines.columns, rawDataMultipleLines.rows);

storiesOf("@operational/visualizations/2. Line chart", module)
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
        data={singleFrame}
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
        data={singleFrame}
        metricDirection="horizontal"
      />
    );
  })
  .add("vertical, multiple lines", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <MultipleLines
        metric="sales"
        categorical="Customer.City"
        series={["Customer.AgeGroup", "Customer.Gender"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={multiplesFrame}
        metricDirection="vertical"
        colorBy={["Customer.AgeGroup"]}
      />
    );
  })
  .add("horizontal, multiple lines", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <MultipleLines
        metric="sales"
        categorical="Customer.City"
        series={["Customer.Gender", "Customer.AgeGroup"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={multiplesFrame}
        metricDirection="horizontal"
        colorBy={["Customer.AgeGroup", "Customer.Gender"]}
      />
    );
  })
  .add("vertical, missing data", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <MultipleLines
        metric="sales"
        categorical="Customer.Country"
        series={["Customer.City", "Customer.Gender", "Customer.AgeGroup"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={multiplesFrame}
        metricDirection="vertical"
        colorBy={["Customer.City"]}
      />
    );
  });;
