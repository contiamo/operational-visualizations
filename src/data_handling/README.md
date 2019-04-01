# Multi Dimensional Dataset (MDD)

This data structure is similar to a "dataframe" as known from R or pandas. It supports multi-dimensional datasets that may be split by dimensions along columns (`x` axis) and rows (`y` axis). MDD is an **immutable data structure**. All methods return new MDDs and do not change the source MDD.

The MDD is a very helpful tool to prepare multi-dimensional data returned from an API so that it can be displayed by visualizations. The MDD allows fine-grained control over how multi-dimensional data is mapped to one or multiple visualizations. Internally, the MDD stores and accesses row-based data but does not expose this fact or require any special effort from the user when working with columns.

## Important concepts / types used in the MDD

### Dimension

A label for an aspect, feature or category by which data can be split. E.g. _"Country"_.

A Dimension has the following shape:

```typescript
interface Dimension {
  key: DimensionKey;
}

// Example Dimension
const CountryDimension: Dimension = { key: "Country" };
```

### Dimension Value

A specific value of a Dimension. E.g. _"Germany"_ would be a Dimension Value for the Dimension _"Country"_.

A Dimension Value is a `string` or a `number`.

In many places the Dimension Value is returned in a wrapper that also contains the information about which Dimension this Dimension Value belongs to:

```typescript
type DimensionValue = string;

type DimensionWithValue = Dimension & {
  value: DimensionValue;
};
```

### Column Dimensions

The Dimensions along the `x` axis in their defined order.

### Row Dimensions

The Dimensions along the `y` axis in their defined order.

### Column

A column of data in the MDD. It is defined by its specific combination of Dimension Values (along the `x` axis).

### Row

A row of data in the MDD. It is defined by its specific combination of Dimension Values (along the `y` axis).

### Cell

A cell contains the value for a specific combination of Dimension Values (along the `x` and `y` axis). The cell value can be anything - a number, a string, a boolean, an object etc. - but the type has to be consistent within one MDD.

### Predicate

A matcher against one or multiple Dimensions and one or multiple of their Values along the `x` or `y` axis. An example would be "All rows where Country is Germany".

### Slice

@todo

## Creating an MDD

@todo: Add spec of raw dataset here.

## Important methods to work with an MDD

### isEmpty

@todo

### rowDimensions

@todo

### columnDimensions

@todo

### rows

@todo

### columns

@todo

### serialize

@todo

### slice

@todo

### aggregate

@todo

### transpose

@todo

### transform

@todo

### readonly

@todo: this functionality can be removed
