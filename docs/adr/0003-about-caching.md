# 3. about-caching

Date: 2019-07-30

## Status

2019-07-30 proposed

## Context

Some decisions were taken about how data is organised and how we do caching, but they weren't explicitly documented. Let's fix that.

We have 3 methods of caching:

- flru in PivotFrame
- WeakMaps in stats utils
- hooks for scales

### Referential transparency

React relies a lot on **referential transparency** when it decides if it needs to rerender or not e.g. it compares objects as reference (so called shallow comparison), it doesn't compare structure. It is a very cheap operation, because underneath it compares pointers.

For example, if you compare primitive values:

```ts
1 === 1; //true
```

but when you compare objects

```ts
{} === {}; // false
const a = {};
a === a; // true
```

Every `{}` creates new instance of the object, and a new reference. Referential transparency is closely related to the "purity" of function.

This is a pure function:

```ts
const add = (x: number, y: number) => x + y;
```

but is the next one a pure function as well?

```ts
const getPoint = (x: number) => new Point(x);
getPoint(0) === getPoint(0); // false
```

It doesn't seem to have any side effects, but it produces a new instance every time. One of the solutions to this problem is to use memoisation so it would always return the same result

```ts
const memoise = f => {
  const cache = new Map();
  return x => {
    if (!cache.has(x)) cache.set(x, f(x));
    return cache.get(x);
  };
};
const getPoint = memoise((x: number) => new Point(x));
getPoint(0) === getPoint(0); // true
```

The problem here is that memory is not infinite, and we need to clean up it at some point. How are we going to do it? There are many approaches to this problem. We chose to store some number (1024 in our case for PivotFrame) of recently created references. It is ok, because we need to show only part of the PivotFrame (PivotGrid) on the screen (we use "windowing" technique). In practice it means the following

```ts
const first = frame.column(0);
frame.column(1);
// frame.column(2) ... frame.column(500)
first === frame.column(0); // true, still in cache
// frame.column(500) ... frame.column(1024)
first === frame.column(0); // false, evicted from cache
```

Not all operations are referentially transperent, for example DataFrames `pivot` is not.

### Performance optimisation

Another point of caching is that you can trade computational cycles for memory e.g. once you have done a computation you can cache it and next time when you need it would be faster, but you need to store results in memory. For example, when we need to calculate maximum value of or total value of the column - we need to go through the whole data set so it's O(N) operations, which is not much from one side, but on the other side if you do this for every cell in PivotGrid (to calculate axes and on each React rerender) the whole cost can turn into O(N^2).

Caching is easy to do with something like `memoise`, but the question is when and how to clean up cache. Imagine we load one data set, do a calculation, load another data set, do more calculations - we will run out of cache at some point.

We can employ a nice trick to solve this problem (especially if we deal with a referentially transparent system). We can store cache until the initial object for which we did the calculation is in memory. As soon as it goes away (swiped by Garbage Collector), we can drop the cache as well. To do this in JS we can use `WeakMap`.

```ts
const weakMemoise = f => {
  const cache = new WeakMap();
  return x => {
    if (!cache.has(x)) cache.set(x, f(x));
    return cache.get(x);
  };
};
```

The limitation of `WeakMap` is that keys can't be primitive values, but this is ok because we can use `FragmentFrame` and `DataFrame` as cache keys.

Inside each cache "slot" we can store an empty object, inside which we can store cache for each column, for each type of operation.

So cache of `max` of `firstColumn` of `frame`, would be stored as:

```ts
cache.get(frame)[firstColumn]["max"];
```

As soon as `frame` is removed by GC, the whole slot (`cache.get(frame)`) will be removed as well.

This system works only with referentially transparent functions, so for example it will not work with FragmentFrames `groupBy`. (Maybe we need to change `groupBy` and return some kind of `GroupFrame` 🤔).

### Hooks

Some values, like scales, are hard to cache with the `WeakMap` style cache, because you have a lot of components so you will need really deep nesting in "slot" object (we already use 2 levels :/), which is hard to work with.

To solve such cases we decided to use hooks, which simplify caching (because in React they can attach cache to React tree node). The downside of this, is that we can't use render prop, we were forced to switch to components. See 0002-about-render-props for details.

## Decision

So we have 3 approaches for caching, but we have room for improvement. For example, we can't have (or can we?) big number of arguments in stats functions.

Not all of our methods are referentially transparent. We may want to address this later.

## Consequences

N/A
