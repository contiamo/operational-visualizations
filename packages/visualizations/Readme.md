# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

Set of visualisations primitives for building visualisations.

⚠️ This is highly experimental package and doesn't follow semantic versioning yet.

## Installation

```
yarn add @operational/visualizations
```

## Usage

```tsx
import * as React from "react";
import { DataFrame } from "@operational/frame";
import { Axis, Bars, Chart, useScaleBand, useScaleLinear } from "@operational/visualizations";

const frame = new DataFrame(/* ... */);

interface BarChartProps<Name extends string> {
  width: number;
  height: number;
  margin: number | [number, number] | [number, number, number, number];
  data: BarsProps["data"];
  categorical: Name;
  metric: Name;
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({ width, height, margin, data, categorical, metric }: BarChartProps<Name>) => {
  const categoricalScale = useScaleBand({
    frame: data,
    column: categorical,
    range: [height, 0],
  });
  const metricScale = useScaleLinear({
    frame: data,
    column: metric,
    range: [0, width],
  });

  return (
    <Chart width={width} height={height} margin={margin} style={{ background: "#fff" }}>
      <Bars
        data={data}
        categorical={categorical}
        metric={metric}
        categoricalScale={categoricalScale}
        metricScale={metricScale}
        style={{ fill: "#1f78b4" }}
      />
      <Axis scale={categoricalScale} position="left" />
      <Axis scale={metricScale} position="bottom" />
    </Chart>
  );
};

const App = () => (
  <BarChart metric="sales" categorical="Customer.City" width={300} height={300} margin={[20, 60]} data={frame} />
);
```
