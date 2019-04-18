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
OK                                      NOT OK + order of categories changed    NOT OK + different size of bar

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
