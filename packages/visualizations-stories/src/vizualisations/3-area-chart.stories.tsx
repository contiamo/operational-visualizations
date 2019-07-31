import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  DataFrame,
  IterableFrame,
  RawRow,
  ColumnCursor,
  stackRowBy
} from "@operational/frame";
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

const rawDataStacked = {
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
    ["North America", "Canada", "Toronto", "<50", "Female", 801, 80.2],
    ["Europe", "Germany", "Berlin", "<50", "Male", 101, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Male", 201, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 301, 30.2],
    ["Europe", "UK", "London", "<50", "Male", 401, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 501, 50.2],
    ["North America", "USA", "New York", "<50", "Male", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Male", 801, 80.2]
  ]
};

const frame = new DataFrame(rawData.columns, rawData.rows);
const stackedFrame = new DataFrame(rawDataStacked.columns, rawDataStacked.rows);

interface LineChartProps<Name extends string> {
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
  "#006865"
];

export const joinArrayAsString = (array: string[]) => {
  return (array || []).join("/");
};

export const getColorScale = (
  data: IterableFrame<string>,
  colorBy: Array<ColumnCursor<string>>
) => {
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
 * Examples of how you can compose more complex charts out of 'atoms'
 */
const AreaChart = <Name extends string>({
  width,
  height,
  margin,
  data,
  categorical,
  metric,
  metricDirection,
  colorBy,
  stacked
}: LineChartProps<Name>) => {
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);
  const categoricalScale = useScaleBand({
    frame: data,
    column: categoricalCursor,
    range: metricDirection === "horizontal" ? [0, height] : [0, width]
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metricCursor,
    categorical: stacked ? categoricalCursor : undefined,
    range: metricDirection === "horizontal" ? [0, width] : [height, 0]
  });
  const colorScale = getColorScale(
    data,
    (colorBy || []).map(c => data.getCursor(c))
  );
  const stackRow = stackRowBy(categoricalCursor, metricCursor);

  return (
    <Chart
      width={width}
      height={height}
      margin={margin}
      style={{ background: "#fff" }}
    >
      {data.groupBy(colorBy || []).map((grouped, key) => (
        <Area
          key={key}
          metricDirection={metricDirection}
          data={grouped}
          categorical={data.getCursor(categorical)}
          metric={data.getCursor(metric)}
          categoricalScale={categoricalScale}
          metricScale={metricScale}
          stackRow={stacked ? stackRow : undefined}
          style={{ fill: colorScale(grouped.row(0)), stroke: "#fff" }}
        />
      ))}
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
      <AreaChart
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
      <AreaChart
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
  .add("stacked horizontal", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <AreaChart
        metric="sales"
        categorical="Customer.City"
        colorBy={["Customer.Gender"]}
        stacked={true}
        width={300}
        height={300}
        margin={magicMargin}
        data={stackedFrame}
        metricDirection="horizontal"
      />
    );
  })
  .add("stacked vertical", () => {
    // number of pixels picked manually to make sure that YAxis fits on the screen
    const magicMargin = 60;
    return (
      <AreaChart
        metric="sales"
        categorical="Customer.City"
        colorBy={["Customer.Gender"]}
        stacked={true}
        width={300}
        height={300}
        margin={magicMargin}
        data={stackedFrame}
        metricDirection="vertical"
      />
    );
  });
