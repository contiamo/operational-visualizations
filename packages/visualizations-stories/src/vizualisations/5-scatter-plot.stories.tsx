import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame } from "@operational/frame";
import { Axis, Dots, Chart, ChartProps, Legend, useScale, ScaleType, useColorScale } from "@operational/visualizations";

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

interface ScatterPlotProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  x: Name;
  y: Name;
  xType: ScaleType;
  yType: ScaleType;
  colorBy?: Name[];
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const ScatterPlot = <Name extends string>({
  width,
  height,
  margin,
  data,
  x,
  y,
  xType,
  yType,
  colorBy,
}: ScatterPlotProps<Name>) => {
  const xCursor = data.getCursor(x);
  const yCursor = data.getCursor(y);

  const xScale = useScale({
    type: xType,
    frame: data,
    column: xCursor,
    range: [0, width],
  });
  const yScale = useScale({
    type: yType,
    frame: data,
    column: yCursor,
    range: [height, 0],
  });

  const colorCursors = (colorBy || []).map(c => data.getCursor(c));
  const colorScale = useColorScale(data, colorCursors);

  return (
    <div style={{ display: "inline-block" }}>
      <Legend data={data} colorScale={colorScale} cursors={colorCursors} />
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        <Dots
          data={data}
          x={xCursor}
          y={yCursor}
          xScale={xScale}
          yScale={yScale}
          style={row => ({ fill: colorScale(row) })}
          showLabels={true}
        />
        <Axis scale={xScale} position="bottom" />
        <Axis scale={yScale} position="left" />
      </Chart>
    </div>
  );
};

storiesOf("@operational/visualizations/5. Scatter plot", module)
  .add("band x linear", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];
    return (
      <ScatterPlot
        x="Customer.City"
        y="sales"
        xType="band"
        yType="linear"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  })
  .add("linear x band", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <ScatterPlot
        y="Customer.City"
        x="sales"
        yType="band"
        xType="linear"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  })
  .add("band x band", () => {
    const magicMargin = 60;
    return (
      <ScatterPlot
        y="Customer.City"
        x="Customer.Continent"
        yType="band"
        xType="band"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  })
  .add("linear x linear", () => {
    const magicMargin = 60;
    return (
      <ScatterPlot
        y="revenue"
        x="sales"
        yType="linear"
        xType="linear"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
      />
    );
  });
