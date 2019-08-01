# 4. about-row-cursor

Date: 2019-08-01

## Status

2019-08-01 proposed

## Context

We use `RawRow` in `frame` library to expose rows from data stored in the `frame`. At the moment `RawRow` implemented as `export type RawRow = any[];`. This approach exposes implementation details - that `frame` is row oriented storage. If we would want to swap implementation from row oriented to column oriented storage, we may need to change implementation details and it will break code for people who use our library. We need to hide implemntation details.

### Row-oriented storage vs Column-oriented storage

The main difference between two storages is the cost of accessing rows and columns:

|            | row-oriented | column-oriented |
| ---------- | ------------ | --------------- |
| get row    | O(1)         | O(N)            |
| get column | O(N)         | O(1)            |

(the simplified version, really depends on the implementation).

As well you can have some hybrid solution, like return cursors instead of raw data, to get data lazily.

At the moment we have all data loaded in the memory, so this distinction is not so critical, but as soon as we would want to switch implementation to some proxy which will read data from the remote server, this can be important.

### Rename

The minimal improvement we can make is to rename `RawRow` to `RowCursor`, to shift away from mentality of row-oriented storage. To get the value from the table you would need to use two cursors, like x and y coordinates (or latitude and longitude):

```ts
columnCursor(rowCursor); // this is what we have right now
// or
getValue(rowCursor, columnCursor);
// or
rowCursor(columnCursor);
```

### Hide implementation

The next step would be to hide implementation. We can:

- wrap rows into objects, to hide the shape of the data
- in Flow you can hide implementation with [opaque type](https://flow.org/en/docs/types/opaque-types/), maybe something similar is possible with interfaces in TS

### Premature optimisation

At the moment it is possible to write this:

```ts
rowCursor[columnCursor.index];
// which is the same as
columnCursor(rowCursor);
```

Assumption was that array access is faster than function call (which inside still will do array access). It may happen that it was premature optimisation and it exposes a lot of implementation details.

Possible middle-ground here would be [macros](https://github.com/Microsoft/TypeScript/issues/4892): developer would write `columnCursor(rowCursor);` but generated JS contains `rowCursor[columnCursor.index];`, so in case we would change implmentation we can as well change implementation of macro. And user of our library doesn't need to worry about implemntation details.

## Decision

For now we only took first step (rename, in this PR). We will think about other steps in the future.

## Consequences

N/A
