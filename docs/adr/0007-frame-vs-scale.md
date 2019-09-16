# 7. frame-vs-scale

Date: 2019-09-13

## Status

2019-09-13 proposed

## Context

When we draw charts we iterate over the frame, as the result there are some issues with continuous charts (Line, Area):

- it will draw lines in case of missing data (to prevent this we added special code)
- there is a chance it will draw a "twist" (or tangle, or knot), because **there is no guarantee that points in Scale and in Frame are in the same order**

This is the same issue as reported in [#94](https://github.com/contiamo/operational-visualizations/issues/94).

### uniqueValues issue

BandScale is built from unqiue values of the frame (`uniqueValues(frame, column)`). Let's assume we have following frame

| age  | city    |
| ---- | ------- |
| < 50 | Dresden |
| < 50 | London  |
| > 50 | Berlin  |
| > 50 | Dresden |

Unqiue values of the frame: `Dresden, London, Berlin`. But if we would group frame by `age` and take each fragment separately

- `< 50`: `Dresden, London`
- `> 50`: `Berlin, Dresden` (vs scale's `Dresden, London, Berlin`)

If we would iterate over the Frame and oreder of points in Scale and Frame is different (as example above), we would get "twist":

```
^              3        4
|              *--------*--
|               \
|                \
|      1          \
|  ----*-----------*2
|
+---------------------------->
       A      B     C    D
```

This is wrong, instead it should look like:

```
^             2         4
|            /*\       *--
|           /   \     /
|          /     \   /
|      1  /       \ /
|  ----*-/         *3
|
+---------------------------->
       A      B     C    D
```

### uniqueValues solution

The only solution I see is to sort Frame by the same values we use for grouping and for graphing (e.g. in this case we would sort by age and city). This way we can sort unique values as well:

```js
cacheItem.unique = [...unique].sort();
```

_Note_: The default sort order is built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values (for numbers it produce unexpected results).

On the other hand if we would want to sort the data on the server, then we can't use `[...unique].sort();`, because we wouldn't know which kind of sorting criteria server is using.

### Missing data handling

If we would have consistent order of items in Frame and Scale we could iterate over Scale instead of Frame and this way we can easily track if there are missing data points or not.

```ts
const xTicks = xScale.domain();
let offset = 0;
xTicks.map((z, i) => {
  const row = data.row(i + offset) || [];
  if (z !== x(row)) {
    offset -= 1;
    return; // undefined will be skipped by `.defined()` d3 function
  }
  return row;
});
```

## Decision

Decision here...

## Consequences

Consequences here...
