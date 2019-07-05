# Operational PivotGrid [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

This component is used to show pivot table. Cells can be simple text (classical pivot table) or charts, to do the trick it uses `cell` render prop, which will get frame as param (as well as other params).

## Installation

```
yarn add @operational/grid
```

## Usage

```tsx
import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { DataFrame } from "@operational/frame";
import { PivotGrid } from "@operational/grid";

const frame = new DataFrame(/* ... */);
const pivotedFrame = frame.pivot({
  /* ... */
});

const App = () => (
  <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
    {({ width, height }) => <PivotGrid width={width} height={height} data={pivotedFrame} measures={/* ... */} />}
  </AutoSizer>
);
```

### Required params

PivotGrid expects `width` and `height` as params, because it uses virtual scrolling, so it needs to know dimensions. You can use `react-virtualized-auto-sizer` to make `<PivotGrid />` to use all available space.

PivotGrid expects `PivotFrame` as `data` param. It will provide information about which values to use as rows and columns and the actual data.

PivotGrid expects `measures` as param. For text-based pivot table it is required, for pivot table of charts it is optional.

PivotGrid expects `cell` render property, which will render content of cells. For text-based pivot table it is optional.

### Optional params

`accessors.width`, `accessors.height` - accessors (basically callbacks) responsible for detecting width and height of cells.

`style.cell` - styles of cell, you can use it to provide padding for example

`style.border` - style of border

`measuresPlacement` - if we want to place measures in rows or columns. Defaults to column.
