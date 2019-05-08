# PivotFrame

## Empty cells

We discovered that there is an edge case with empty cells when we do pivoting. For example we use SQL-like interface to get the data and we use `LIMIT` to prevent overfetching data.

```sql
SELECT A, B, C FROM table_name LIMIT 5
```

We can get response like this:

```
+-----+
|A|B|C|
+-----+
|q|r|1|
+-----+
|w|t|2|
+-----+
|e|y|3|
+-----+
|q|t|4|
+-----+
|w|y|5|
+-----+
```

If we pivot this data:

```tsx
const pivotedFrame = dataFrame.pivot({ rows: ["A"], columns: ["C"] });
<PivotGrid data={pivotedFrame} measures={["C"]} />;
```

We will get display like this

```
  +-----+
  |r t y|
+-------+
|q|1|4| |
| +-----+
|w| |2|5|
| +-----+
|e| | |3|
+---+---+
```

As you can see some cells are missing, but they are missing not because there is no data in the database, but because of the limit that we set for select query.

## Other

We can use type of the column (`type` field in the schema) to determine text alignment in the cells - numbers should be aligned to the right in cells (with `font-variant-numeric: tabular-nums;`)

We may want to show names of dimensions in grid headers.
