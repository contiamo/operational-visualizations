# PivotGrid

TODO:

- rename to Grid after deleting previous version.
- add tests as soon as we finalise API

This component is used to show pivot table. Cells can be simple text (classical pivot table) or charts, to do the trick it uses `cell` render prop, which will get Frame as param (as well as other params).

## Required params

Grid expects `width` and `height` as params, because it uses virtual scrolling, so it needs to know dimensions. You can use `react-virtualized-auto-sizer` to make `<Grid />` to use all available space.

Grid expects `PivotFrame` as `data` param. It will provide information about which values to use as rows and columns and the actual data.

Grid expects `measures` as param. For text-based pivot table it is required, for pivot table of charts it is optional.

Grid expects `cell` render property, which will render content of cells. For text-based pivot table it is optional.

## Optional params

`accessors.width`, `accessors.height` - accessors (basically callbacks) responsible for detecting width and height of cells.

`style.cell` - styles of cell, you can use it to provide padding for example

`style.border` - style of border

`measuresPlacement` - if we want to place measures in rows or columns. Defaults to column.
