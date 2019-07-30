import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame, ColumnCursor, IterableFrame, RawRow, stackRowBy } from "@operational/frame";
import {
  AxialChartProps,
  Axis,
  Bars,
  Chart,
  ChartProps,
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
  margin: ChartProps["margin"];
  data: DataFrame<Name>;
  categorical: Name;
  metric: Name;
  metricDirection: AxialChartProps<string>["metricDirection"];
  colorBy?: Name[];
  stacked?: boolean;
}

const colorPalette = [
  "#1499CE",
  "#7C246F",
  "#EAD63F",
  "#343972",
  "#ED5B17",
  "#009691",
  "#1D6199",
  "#D31F1F",
  "#AD329C",
  "#006865",
];

export const joinArrayAsString = (array: string[]) => {
  return (array || []).join("/");
};

export const getColorScale = (data: IterableFrame<string>, colorBy: Array<ColumnCursor<string>>) => {
  if (colorBy.length === 0) {
    return () => colorPalette[0];
  }
  const uniqueValues = data.uniqueValues(colorBy).map(joinArrayAsString);
  return (row: RawRow) => {
    const valuesString = joinArrayAsString(colorBy.map(cursor => cursor(row)));
    const index = uniqueValues.indexOf(valuesString);
    return colorPalette[index % colorPalette.length];
  };
};

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  colorBy,
  stacked,
  metric,
  metricDirection,
}: BarChartProps<Name>) => {
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);
  const categoricalScale = useScaleBand({
    frame: data,
    column: categoricalCursor,
    range: metricDirection === "horizontal" ? [0, height] : [0, width],
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metricCursor,
    categorical: categoricalCursor,
    range: metricDirection === "horizontal" ? [0, width] : [height, 0],
  });
  const colorScale = getColorScale(data, (colorBy || []).map(c => data.getCursor(c)))

  const stackRow = stackRowBy(categoricalCursor, metricCursor)

  return (
    <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
      {data.groupBy(colorBy || []).map(grouped =>
        <Bars
          metricDirection={metricDirection}
          data={grouped}
          categorical={categoricalCursor}
          metric={metricCursor}
          categoricalScale={categoricalScale}
          metricScale={metricScale}
          stackRow={stacked ? stackRow : undefined}
          style={row => ({ fill: colorScale(row), opacity: 0.5 })}
        />
      )}
      <Axis scale={categoricalScale} position={metricDirection === "horizontal" ? "left" : "bottom"} />
      <Axis scale={metricScale} position={metricDirection === "horizontal" ? "bottom" : "left"} />
    </Chart>
  );
};

storiesOf("@operational/visualizations/1. Bar chart", module)
  .add("horizontal", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = [5, 10, 20, 60] as ChartProps["margin"];

    return (
      <BarChart
        metric="sales"
        categorical="Customer.City"
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
        colorBy={["Customer.City"]}
        stacked={true}
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
        colorBy={["Customer.Country", "Customer.City"]}
        stacked={true}
        width={300}
        height={300}
        margin={magicMargin}
        data={frame}
        metricDirection="vertical"
      />
    );
  });
