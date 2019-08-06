import * as React from "react";
import { storiesOf } from "@storybook/react";
import { DataFrame, IterableFrame, RowCursor } from "@operational/frame";
import {
  AxialChartProps,
  Axis,
  Bars,
  Chart,
  ChartProps,
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
}

const colorPalette = theme.palettes.qualitative.operational;

type ColorCacheItem = Record<string, string>

const colorCache = new WeakMap<IterableFrame<string>, Record<string, ColorCacheItem>>();

const getColorCacheItem = (frame: IterableFrame<string>, key: string): ColorCacheItem => {
  if (!colorCache.has(frame)) {
    colorCache.set(frame, {})
  }
  const cacheEntry = colorCache.get(frame)!;
  if (!cacheEntry[key]) {
    cacheEntry[key] = {};
  }
  return cacheEntry[key];
}

export const joinArrayAsString = (array: string[]) => {
  return (array || []).join("/");
};

export const getColorScale = (frame: IterableFrame<string>, colorBy: Array<string>) => {
  const colorByKey = joinArrayAsString(colorBy)
  let cacheItem = getColorCacheItem(frame, colorByKey);
  const colorByCursors = (colorBy || []).map(x => frame.getCursor(x));
  const uniqueValues = frame.uniqueValues(colorBy || []).map(joinArrayAsString);
  if (Object.entries(cacheItem).length === 0) {
    if (colorBy.length === 0 || uniqueValues.length === 1) {
      return () => colorPalette[0];
    }
    uniqueValues.forEach(value => {
        const index = uniqueValues.indexOf(value);
        cacheItem[value] = colorPalette[index % colorPalette.length]
    })
  }

  return (row: RowCursor) => {
    const valuesString = joinArrayAsString(colorByCursors.map(cursor => cursor(row)));
    if (!cacheItem[valuesString]) {
      const index = uniqueValues.indexOf(valuesString);
      cacheItem[valuesString] = colorPalette[index % colorPalette.length]
    }
    return cacheItem[valuesString]
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
  metric,
  metricDirection,
  colorBy,
}: BarChartProps<Name>) => {
  const categoricalCursor = data.getCursor(categorical);
  const metricCursor = data.getCursor(metric);

  const frame = data.groupBy([categoricalCursor]);

  const categoricalScale = useScaleBand({
    frame: data,
    column: categoricalCursor,
    range: metricDirection === "horizontal" ? [0, height] : [0, width],
  });
  const metricScale = useScaleLinear({
    frame,
    column: metricCursor,
    range: metricDirection === "horizontal" ? [0, width] : [height, 0],
  });

  const colorScale = getColorScale(data, colorBy || []);

  const uniqueValues = data.uniqueValues(colorBy || []).map(joinArrayAsString);
  const legendData = uniqueValues.map(key => ({
    key,
    label: key,
    color: getColorCacheItem(data, joinArrayAsString(colorBy || []))[key]
  }))

  return (
    <div style={{ display: "inline-block" }}>
      <Legend data={legendData}/>
      <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
        {frame.map(grouped => (
          <Bars
            metricDirection={metricDirection}
            data={grouped}
            categorical={categoricalCursor}
            metric={metricCursor}
            categoricalScale={categoricalScale}
            metricScale={metricScale}
            style={row => ({ fill: colorScale(row) })}
          />
        ))}
        <Axis scale={categoricalScale} position={metricDirection === "horizontal" ? "left" : "bottom"} />
        <Axis scale={metricScale} position={metricDirection === "horizontal" ? "bottom" : "left"} />
      </Chart>
    </div>
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
      />
    );
  });
