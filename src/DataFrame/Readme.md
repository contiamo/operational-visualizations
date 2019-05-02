# Frame

Frame represents multidimensional data. It is similar to SQL table or CSV file or Pandas DataFrame or n-dimensional space described by Cartesian coordinates (x,y,z...).

DataFrame has two parameters:

- schema - name of dimensions (as well called columns), order of dimensions and type of dimensions
- data - actual data, represented as list of lists. Technically speaking it is list of tuples for row-oriented implemntation and tuple of lists for column-oriented implementation.

Frames are used as medium for passing and working with multidimensional data. It can be consumed by `<Grid />` to show pivot table or by visual components to show charts.

```
+--------+
|Id|Name |
+--------+
| 1|Hilda|
| 2|David|
| 3|Frida|
|  |     |
...
```

## Schema

```ts
type Schema<Name extends string> = Array<{ name: Name; type?: any }>;
```

At the moment of writing type is not used, it is here for future extension. It is up to library consumer how to use it, that is why it is marked as `any`. For example, it can be `"string" | "number" | "boolean"` or types from [io-ts](https://github.com/gcanti/io-ts#implemented-types--combinators).

```ts
const schema = [{ name: "Id" as "Id", type: "number" }, { name: "Character" as "Character", type: "string" }];
```

## Data

At the moment of writing Frames are implemented as row-oriented storages, this should not affect consumer of the library and we can switch to column-oriented storage in the future. Now for simplicity shape of data is as well expected to be row-oriented.

For example:

```ts
const data = [[1, "Hilda"], [2, "David"], [3, "Frida"]];
```

## Implementation

All Frames are immutable. As soon they were created they do no mutate internal values, but at the moment of writing they do not have any protectection against mutation from the outside, for example you can mutate array of data if it was passed as variable and you still have access to this variable, we leave it to developers to not violate immutability of internals.

Because Frames are immutable, they share the same data and scheme - passed as reference, not copied.

Where it makes sense, Frames use lazy calculations, for example PivotFrame indexes lazily calculated.

## DataFrame

DataFrame - is the Frame that developer would use as starting point, to construct first frame, all other Frames would be possible to get from it.

```ts
import { DataFrame } from "@operational/visualizations";
const dataFrame = new DataFrame(schema, data);
```

## PivotFrame

PivotFrame is the special case of Frame designed for `<Grid>` to show pivot table. In addition to data and scheme it has two indexes - one for columns and one for rows.

```
      +----------+
      |Columns   |
+----------------+
|Rows |Cells     |
|     |          |
|     |          |
|     |          |
+-----+----------+
```

To get the PivotFrame you need to use `pivot` method on `DataFrame` instance.

```ts
const pivotedFrame = dataFrame.pivot({ rows: ["A", "B"], columns: ["C", "D"] });
```

### Indexes

`rows` and `columns` indexes counstructed by taking vertical slice of DataFrame with corresponding columns and collecting unique rows in those DataFrames. This operation corresponds to following SQL statement

```sql
SELECT DISTINCT column_name, column_name FROM table_name;
```

For example, if we have following DataFrame and want to build index for rows (`rows: ["A", "B"]`):

| A   | B   | C   | D   | E   |
| --- | --- | --- | --- | --- |
| Q   | W   | z   | x   | 1   |
| E   | R   | z   | x   | 2   |
| E   | R   | c   | v   | 3   |

Vertical slice with A, B columns would look like

| A   | B   |
| --- | --- |
| Q   | W   |
| E   | R   |
| E   | R   |

After leaving out only unique combinations

| A   | B   |
| --- | --- |
| Q   | W   |
| E   | R   |

```ts
pivotedFrame.rowsIndex(); // [["Q", "W"], ["E", "R"]];
```

To access data via index we can use `row`, `column` or `cell` methods, which will return new Frame with corresponding horizontal slices of the data (FragmentFrame).

```ts
pivotedFrame.row(["E", "R"]); // FragmentFrame<[["E", "R", "z", "x", 2], ["E", "R", "c", "v", 3]]>
pivotedFrame.cell(["E", "R"], ["z", "x"]); // FragmentFrame<[["E", "R", "z", "x", 2]]>
```

## FragmentFrame

FragmentFrame - limited version of DataFrame. Maybe in the future we will remove it in favour of DataFrame. Having it separated from DataFrame simplifies code, most likely this will change as soon as we will add more code.

At the moment of writing it exposes:

- `forEach` method to iterate over the rows and
- `peak` method to select value of column from the first row of frame (assumes there is only one row in the frame). Used for the `<Grid />`
