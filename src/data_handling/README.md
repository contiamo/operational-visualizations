# Multi Dimensional Dataset (MDD)

This data structure is similar to a "dataframe" as known from R or pandas. It assumes that data is tabular and may be split by dimensions along columns (`x` axis) and rows (`y` axis). MDD is an _immutable data structure_. All methods return new MDDs and do not change the source MDD.

The MDD is very helpful to prepare multidimensional data returned from an API so that it can be displayed by visualizations. The MDD allows fine-grained control over how tabular multi-dimensional data is mapped to one or multiple visualizations. Internally, the MDD stores and accesses row-based data but does not expose this fact or require any special effort from the user when working with columns.

### Important concepts / terms for the MDD are

- Dimension: A label for an aspect, feature or category by which data can be split. E.g. "Country".
- Dimension value: A specific value of a Dimension. E.g. "Germany" would be a Dimension Value for "Country".
- Column Dimensions: The Dimensions along the `x` axis in their defined order.
- Row Dimensions: The Dimensions along the `y` axis in their defined order.
- Column: A column of data in the MDD. It is defined by its specific combination of Dimension Values (along the `x` axis).
- Row: A row of data in the MDD. It is defined by its specific combination of Dimension Values (along the `y` axis).
- Cell: A cell contains the value for a specific combination of Dimension Values (along the `x` and `y` axis). The cell
  value can be anything - a number, a string, a boolean, an object etc. - but the type has to be consistent within one MDD.
- Predicate: A matcher against one or multiple Dimensions and one or multiple of their Values along the `x` or `y` axis.
  An example would be "All rows where Country is Germany".
