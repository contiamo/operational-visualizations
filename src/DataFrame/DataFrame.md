# DataFrame

DataFrame suppose to be row- or column-oriented storage similar to SQL table or [Pandas DataFrame](https://pandas.pydata.org/pandas-docs/stable/getting_started/dsintro.html#dataframe).

Main purpose of this structure is to implement medium for data to be consumed by visualisation library,
this means that we are not interested in implementing all features, that Pandas DataFrame or SQL provide, we only need to implement basic operations.

Operations that we need to support:

- `constructor`
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

Types don't have to be JS specific types. We need to decide what is the best option here. It can be as simple as differentiation dimension or measure.

### To static type or not?

Let's assume we have a class:

```ts
class DataFrame<Schema> {
  constructor(schema: Schema, data: InferBasedOn<Schema>);
}
```

we want to have a nice DX, so TS will infer type of data from schema. The challenge is how to implement Schema.

**Schema** - describes names of the columns and types. We need types to:

1. validate shape of the input (minor reason)
2. differentiate numeric vs categorical values. We need this to decide if we can use aggregation function, like sum or average, for this value or not. The question is do we need type or differentiation measures vs dimensions is enough.
3. detect which [scale function](https://github.com/d3/d3-scale) to use

**Row as an object**, Data as a list of Rows - easy to type, the most expensive representation

```ts
import * as t from "io-ts";

const schema = t.type({
  userId: t.number,
  name: t.string
})
type Row = t.TypeOf<typeof schema>>
type Data = Array<Row>
type Schema = typeof schema
```

**Row as a tuple**, Data as a list of Rows (Matrix)

```ts
type Row = [A, B, C, D];
type Data = Array<Row>;
type Schema = ?
```

**Column as a list**, Data as a tuple of Columns (Matrix)

```ts
type Column<T> = Array<T>;
type Data = [Column<A>, Column<B>, Column<C>, Column<D>];
type Schema = ?
```

**Column as a list**, Data as a Record of Columns

```ts
type Column<T> = Array<T>;
type Data = {a: Column<A>, b: Column<B>, c: Column<C>, d: Column<D>};

import * as t from "io-ts";
const schema = t.type({
  a: t.array(t.number),
  b: t.array((t.string)
  //...
})
type Schema = typeof schema
```

**Don't check static types of the data**, but we can check runtime types

```ts
type Column<T> = Array<T>;
type Row<T> = Array<T>;

// row-oriented
type Data = Array<Row<any>>;
// or column-oriented
type Data = Array<Column<any>>;

type Schema = Array<{ name: string; type: t.Type<unknown, unknown, unknown> }>;
```

For our main use-case, I guess, the most pragmatic choice is "Don't check static types of the data" and use row-oriented representation.

**Don't check static types of the input data**, instead check it at runtime and provide static types for all sub-functions based on schema

Use schema to provide types and use some additional config to map input to schema, so schema and shape of the data could be independent (in all previous tasks this wasn't a case).

```ts
import * as t from "io-ts";
const schema = t.type({
  a: t.array(t.number),
  b: t.array((t.string)
  //...
})
type Schema = typeof schema

type Data = ... // any representation + some config to map input data to schema

// for example
class DataFrame<Schema = any> {
  constructor(schema: Schema<Name>, data: ..., config: ...)
  public transform<Name, T>(column: Name, cb: (columnValue: Pick<Schema, Name>) => T);
}
```

### Alternative implementations

**dataframe-js**

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

**DataModel**

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

**Apache Arrow in JS**

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
