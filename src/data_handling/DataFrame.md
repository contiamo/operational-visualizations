# DataFrame

DataFrame suppose to be row- or column-oriented storage similar to SQL table or [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/getting_started/dsintro.html#dataframe).

Main purpose of this structure is to implement medium for data to be consumed by visualisation library,
this means that we are not interested in implementing all features, that Pandas DataFrame or SQL provide, we only need to implement basic operations.

Operations that we need to support:

- `constructor`
- `map` or `transform` - to change the column
- `groupBy` - to prepare data for multiindex
- `pivot` or `multiIndex` - to prepare data for the `Grid`
- `convertToObjects` - to transfrom from Matrix-like representation to list of objects, because this is what many visualisation libraries expect as input, for example semiotic
- `stat` module to detect range for numeric dimensions to display axis in the Grid

Alternatives:

- https://gmousse.gitbooks.io/dataframe-js/#dataframe-js
- https://muzejs.org/docs/introduction-to-datamodel
- https://github.com/walnutgeek/wdf
- https://github.com/apache/arrow/tree/master/js

Yet to be diecided if we want to use row/or column implementation.

## constructor

**constructor** will accept data in row or column format.

**constructor** will accept schema - list of columns with names and types:

```ts
[{ name: "age", type: "number" }, { name: "gender", type: "string" }];
```

instead of hardcoded predefined types as strings we can use validators, like in [`io-ts`](https://github.com/gcanti/io-ts):

```ts
import * as t from "io-ts";

[{ name: "age", type: t.number }, { name: "gender", type: t.string }];
```

this way we can make schema types easily extendable.

### dataframe-js

```js
// From a dictionnary (Hash)
const df = new DataFrame(
  {
    column1: [3, 6, 8], // <------ A column
    column2: [3, 4, 5, 6],
  },
  ["column1", "column2"],
);
```

### DataModel

```js
const data = `Name,Miles_per_Gallon,Cylinders,Displacement,Horsepower,Weight_in_lbs,Acceleration,Year,Origin
  chevrolet chevelle malibu,18,8,307,130,3504,12,1970,USA
  buick skylark 320,15,8,350,165,3693,11.5,1970,USA
  plymouth satellite,18,8,318,150,3436,11,1970,USA`;

const schema = [
  {
    name: "Name" /* Name of the variable in data */,
  }, // By default its a dimension
  {
    name: "Miles_per_Gallon", // Name of the variable in data
    type: "measure",
    // Default aggregation function by defult is sum
  },
  {
    name: "Cylinder", // Name of the variable
    type: "dimension",
  },
  {
    name: "Displacement", // Name of the variable
    type: "measure",
    defAggFn: "max", // Default aggregation function is max for displacement
  },
  {
    name: "HorsePower", // Name of the variable
    type: "measure",
    defAggFn: "max",
  },
  {
    name: "Weight_in_lbs", // Name of the variable
    type: "measure",
    defAggFn: "avg",
  },
  {
    name: "Acceleration", // Name of the variable
    type: "measure",
    defAggFn: "avg",
  },
  {
    name: "Year", // Name of the variable
    type: "dimension", // Date time is a dimension
    subtype: "temporal", // Subtype is temporal by which DataModel understands its a datetime variable
    format: "%Y", // Token to parse datetime from data. Here its parsing the each value of the variable as year
  },
  { name: "Origin" },
];
//Ingest both the data and schema in DataModel
const DataModel = muze.DataModel;
const dm = new DataModel(data, schema);
```

### Apache Arrow in JS

```js
const fields = [
  {
    name: "precipitation",
    type: {
      name: "floatingpoint",
      precision: "SINGLE",
    },
    nullable: false,
    children: [],
  },
  {
    name: "date",
    type: {
      name: "date",
      unit: "MILLISECOND",
    },
    nullable: false,
    children: [],
  },
];

const rainfall = arrow.Table.from({
  schema: { fields: fields },
  batches: [
    {
      count: LENGTH,
      columns: [
        { name: "precipitation", count: LENGTH, VALIDITY: [], DATA: rainAmounts },
        { name: "date", count: LENGTH, VALIDITY: [], DATA: rainDates },
      ],
    },
  ],
});
```
