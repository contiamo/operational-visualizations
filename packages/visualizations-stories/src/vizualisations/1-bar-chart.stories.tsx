import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame, RowCursor } from "@operational/frame";
import {
  Axis,
  AxisRules,
  Bars,
  Chart,
  ChartProps,
  useColorScale,
  Legend,
  theme,
  useScaleBand,
  useScaleLinear,
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
    ["Europe", "Germany", "Berlin", "<50", "Female", 10000001, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Female", 20000001, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 30000001, 30.2],
    ["Europe", "UK", "London", "<50", "Female", 40000001, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 50000001, 50.2],
    ["North America", "USA", "New York", "<50", "Female", 80000001, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 80000001, 80.2],
  ],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

interface BarChartProps<Name extends string> {
  width: number;
  height: number;
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  categorical: Name;
  metric: Name;
  metricDirection: "horizontal" | "vertical";
  colorBy?: Name[];
  palette?: string[];
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  metric,
  metricDirection,
  colorBy,
  palette,
}: BarChartProps<Name>) => {
  const isVertical = metricDirection === "vertical";
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);

  const frame = data.groupBy([categoricalCursor]);

  const categoricalScale = useScaleBand({
    frame: data,
    column: categoricalCursor,
    range: !isVertical ? [0, height] : [0, width],
  });
  const metricScale = useScaleLinear({
    frame,
    column: metricCursor,
    range: !isVertical ? [0, width] : [height, 0],
  });

  const colorCursors = (colorBy || []).map(c => data.getCursor(c));
  const colorScale = useColorScale(data, colorCursors, palette);

  return (
    <div style={{ width: 420 }}>
      <Legend
        data={data}
        colorScale={colorScale}
        cursors={colorCursors}
        itemWidth={colorCursors.length * 80}
        style={{ height: 40, overflowY: "scroll" }}
      />
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        <AxisRules
          scale={metricScale}
          position={!isVertical ? "bottom" : "left"}
          length={!isVertical ? height : width}
        />
        <AxisRules
          scale={categoricalScale}
          position={!isVertical ? "left" : "bottom"}
          length={!isVertical ? width : height}
        />
        {frame.map((grouped, i) => (
          <Bars
            key={i}
            data={grouped}
            x={isVertical ? categoricalCursor : metricCursor}
            y={isVertical ? metricCursor : categoricalCursor}
            xScale={isVertical ? categoricalScale : metricScale}
            yScale={isVertical ? metricScale : categoricalScale}
            showLabels={true}
            style={(row: RowCursor) => ({ fill: colorScale(row) })}
          />
        ))}
        <Axis
          scale={categoricalScale}
          position={!isVertical ? "left" : "bottom"}
          maxNumberOfTicks={isVertical ? 4 : undefined}
        />
        <Axis scale={metricScale} position={!isVertical ? "bottom" : "left"} />
      </Chart>
    </div>
  );
};

storiesOf("@operational/visualizations/1. Bar chart", module)
  .add("horizontal", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 60, 20, 60] as ChartProps["margin"];

    return (
      <BarChart
        metric="sales"
        categorical="Customer.City"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="horizontal"
      />
    );
  })
  .add("vertical", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <BarChart
        metric="sales"
        categorical="Customer.City"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="vertical"
      />
    );
  })
  .add("stacked horizontal", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <BarChart
        metric="sales"
        categorical="Customer.Country"
        colorBy={["Customer.Country", "Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="horizontal"
      />
    );
  })
  .add("stacked vertical", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <BarChart
        metric="sales"
        categorical="Customer.Continent"
        colorBy={["Customer.City"]}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="vertical"
        palette={theme.palettes.qualitative.pastel}
      />
    );
  });
