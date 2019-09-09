import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame, RowCursor } from "@operational/frame";
import { Chart, ChartProps, getColorScale, Legend, PieChart } from "@operational/visualizations";

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

interface PieChartProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  metric: Name;
  colorBy?: Name[];
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const Pie = <Name extends string>({
  width,
  height,
  margin,
  data,
  metric,
  colorBy,
}: PieChartProps<Name>) => {
  const metricCursor = data.getCursor(metric);
  const colorCursors = (colorBy || []).map(c => data.getCursor(c))
  const colorScale = getColorScale(data, colorCursors);

  return (
    <div style={{ display: "inline-block" }}>
      <Legend data={data} colorScale={colorScale} cursors={colorCursors}/>
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        <PieChart
          width={width}
          height={height}
          data={data}
          metric={metricCursor}
          displayLabels={true}
          style={(row: RowCursor) => ({ fill: colorScale(row), stroke: "#fff" })}
        />
      ))}
      </Chart>
    </div>
  );
};

storiesOf("@operational/visualizations/6. Pie chart", module)
  .add("basic", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <Pie
        metric="sales"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  })
  .add("multiple splits", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <Pie
        metric="sales"
        colorBy={["Customer.Country"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  })
