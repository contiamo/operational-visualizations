# Axes in the Grid

We can put axes in cells for each cell, but this will create a lot of noise.
We can put axes on the side - one (or two) pear each row and per each column.

If we put axes in cells nothing need to be done from Grid side, it is up to implemented what to put in `cell` render property.

If we put axes on the side:

- axis suppose to fit for all cells in the row or all cells in the column
- we need to take into account that Grid can be bigger than screen then axis would be hidden if user scrolls the view
- axis can be based on the statistics of the data in the cells (min, max) or based on external config, for example if we search for time series in a range from Jan to Jul, but we have data only from Jan to Apr, user would expect axes to be full range anyway even if we don't have the data for all months
- all quantative axes (in one direction e.g. all x axes or all y axes) suppose to have same scale and same starting point, otherwise it would be hard for users to compare charts side by side. They still can have different sizes, if scale and starting point is the same.

```
OK - different size of         NOT OK - different scale
X axes but scale is the same

    +---------------+              +---------------+
100 |               |          100 |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
  0 +---------------+            0 +---------------+
200 |               |          100 |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
100 |               |           50 |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
    |               |              |               |
  0 +---------------+            0 +---------------+
```

- categorical axes can have different scale in direction (e.g. different number of ticks, some items missing), but still should have the same scale accross the row (or the column) it associated with.

```
OK                                      NOT OK - order of categories changed    NOT OK - different size of bar

    0            10 0            10         0            10 0            10         0            10 0            10
    +---------------+---------------+       +---------------+---------------+       +---------------+---------------+
    |               |               |       |               |               |       |               |               |
AAA +------+        +------------+  |   AAA +------+        +------------+  |   AAA +------+        +------------+  |
    |               |               |       |               |               |       |               |               |
    |               |               |       |               |               |       |               |               |
BBB +----------+    +---+           |   BBB +----------+    +---+           |   BBB +----------+    +---+           |
    |               |               |       |               |               |       |               |               |
    +-------------------------------+       +-------------------------------+       +-------------------------------+
    |               |               |       |               |               |       |               |               |
AAA +------+        +------+        |   BBB +------+        +------+        |       |               |               |
    |               |               |       |               |               |   AAA +-------+       +------+        |
    |               |               |       |               |               |       +-------+       +------+        |
CCC +---------+     +---------+     |   AAA +---------+     +---------+     |       |               |               |
    |               |               |       |               |               |       |               |               |
    |               |               |       +---------------+---------------+       +---------------+---------------+
DDD +-----+         +--+            |
    |               |               |
    |               |               |
EEE +------------+  +----------+    |
    |               |               |
    +---------------+---------------+

OK - labels inside instead of axes

    0            10 0            10
    +-------------------------------+
    |AAA            |CCC            |
    +------+        +------------+  |
    |               |               |
    |BBB            |DDD            |
    +----------+    +---+           |
    |               |               |
    +---------------+---------------+
```

### One scale across all axes along one direction

To do one scale across all of them we need to calculate range for all values displayed by this scale so we need to calculate stats across whole data set.

For example we want to draw A, B and C measures for each cell using bar chart, we would need to get max values for all of them

```
  1)                 2)

  +-----------+      +-----------+
  |           |      |           |
  |  +        |      |     +  +  |
  |  |     +  |      |     |  |  |
  |  |     |  |    0 +--+--+--+--+
  |  |  +  |  |      |  +        |
  |  |  |  |  |      |           |
0 +--+--+--+--+      +-----------+
     A  B  C            A  B  C
```

For the first case range can be caluclated like this:

```ts
const stats = getQuantitiveStats(frame);
const max = Math.max(stats.max.A, stats.max.B, stats.max.C);
const range = [max, 0];
const scale = scaleLinear()
  .domain(range)
  .range([0, height]);
```

then we need to use this range across all visualisations (`cell=` render prop) and across all axes (X axes in this case).
For simplicity, for the first draft we can agree to use the same height across all cells, otherwise we would need to create new `scale` for each row, to preserve the ratio.

### One scale across one row or column in pivot table

To do this we need to collect statistics across rows or columns in pivot table. Stats structure can look like this:

```ts
// index representation
const stats = {
  rows: { A: { B: {C: { min:.., max:.. }}}}
  columns: { X: { Y: {Z: { min:.., max:.. }}}}
}
// list representation
const stats = {
  rows: [[A, B, C, { min:.., max:.. }]]
  columns: [[X, Y, Z, { min:.., max:.. }]]
}
```

For categorical data it needs collect uique values per rows/columns.

## stats module

To implement stats module we need iterator, for example `forEach(column names)`.
Also we would need to know types of columns (for quantative and categorical data we need different type of stats).

To implement stats module for pivot table (or multi-index) we can provide following functions:

```ts
const pivot = frame.pivot({ rows: ["A", "B", "C"], columns: ["D", "E"] });
```

`pivot.row([a, b, c])` which will return new frame with the same schema as original one, but will include only rows with a, b, c values for A, B, C -indexes e.g. it will be equivalent to `frame.filter((row) => row["A"] === a && row["B"] === b && row["C"] === c)`. Note: name says `row` (plural), but it will return collection.

`pivot.column([d, e])` same as `row`, but for column index.

`pivot.cell([a, b, c], [d, e])` same as `row`, but for row and column index together.

`frame.pivot` can return DatFrame with reference to the original data, and build index lazily and use this index to quickly iterate over rows or columns. Index can look like

```ts
const rowIndex = {
  A: {
    B: {
      C: [1, 4, 5], // number of rows in original frame.data
    },
  },
};
const columnIndex = {
  D: {
    E: [1, 2, 5], // number of rows in original frame.data
  },
};
```

so when we do `pivot.row([a, b, c])`, we can quickly get rows for given index `rowIndex[a][b][c].map(i => originalData[i])`.

We would also need `pivot.rows()`, which will return all entries for rowIndex as list of tuples. And `pivot.columns()` - the same but for columns.
