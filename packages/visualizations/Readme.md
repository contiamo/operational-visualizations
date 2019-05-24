# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

Set of visualisations primitives for building visualisations.

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
  margin: number;
  data: DataFrame<Name>;
  XColumn: Name;
  YColumn: Name;
}

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */
const BarChart = <Name extends string>({ width, height, margin, data, XColumn, YColumn }: BarChartProps<Name>) => {
  const yScale = useScaleBand({ frame: data, column: YColumn, size: height });
  const xScale = useScaleLinear({ frame: data, column: XColumn, size: width });
  return (
    <Chart width={width} height={height} margin={margin}>
      <Bars
        data={data}
        xScale={xScale}
        yScale={yScale}
        x={data.getCursor(XColumn)}
        y={data.getCursor(YColumn)}
        style={{ fill: "#1f78b4" }}
      />
      <Axis scale={xScale} direction="bottom" />
      <Axis scale={yScale} direction="left" />
    </Chart>
  );
};

const App = () => (
  <BarChart XColumn="sales" YColumn="Customer.City" width={300} height={300} margin={60} data={frame} />
);
```
