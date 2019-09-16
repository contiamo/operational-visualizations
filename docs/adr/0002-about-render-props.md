# 2. about-render-props

Date: 2019-07-11

## Status

2019-07-11 proposed

## Context

We planned to use so called [render prop](https://reactjs.org/docs/render-props.html) pattern to be able to swap out content of cells (or headers, or axes) in `PivotGrid`.

Then we discovered that we need code like this:

```tsx
const axes = {
  row: ({ row, width, height }): { row: number; width: number; height: number } => {
    const heightWithoutPadding = height - 2 * padding;
    const yScale = useScaleBand({
      frame: pivotedFrame.row(row) as IteratableFrame<string>,
      column: cityCursor,
      range: [0, height],
    });
    return (
      <svg
        width={width}
        height={heightWithoutPadding}
        viewBox={`0 0 ${width} ${heightWithoutPadding}`}
        style={{ margin: `${padding} 0` }}
      >
        <Axis scale={yScale} transform={`translate(${width}, -${padding})`} position="left" />
      </svg>
    );
  },
};
```

but we can't use hooks inside the render prop, so we [decided to switch from hooks to components](https://github.com/contiamo/operational-visualizations/pull/87).

Then we discovered that we need code like this:

```tsx
const axes = (
  data: DataFrame<string>,
  pivotedFrame: PivotFrame<string>,
  categorical: string,
  measuresInRow: boolean,
) => {
  const Row = ({ row, measure, width, height }: { row: number; measure?: string; width: number; height: number }) => {
    const scale = useScaleBandOrLinear(
      measuresInRow && !!measure
        ? {
            frame: data,
            column: data.getCursor(measure),
```

This is because we need access to "root" `data` to get cursor (see previous discussion about cursors) and other params.

I wonder if we overcomplicated our own life witout any benefit 🤔?

Maybe it was premature optimisation to use hooks for scales, maybe it is very cheap to calculate it again and again (on React re-render)? Maybe we need to remove hooks and instead worry about caching of components?

Limitation of not having `getCursor` on all substructures forces to pass root data everywhere. Either it shows that we are doing something wrong or this limitation was a bad idea.

This code was premature optimisation - I thought it would be more performant than do pattern matching on some tag field (like `.type` in Redux actions):

```ts
case "Empty":
  if (prop.measure && prop.rowIndex === undefined) {
    return {
      measure: true,
    };
  } else if (prop.axis && prop.rowIndex === undefined) {
    return {
      axis: true,
    };
  } else {
    return {
      rowIndex: prop.rowIndex!,
    };
  }
```

But it caused so much confusion in the code.

## Decision

- [We added getCursor everywhere](https://github.com/contiamo/operational-visualizations/pull/93)
- [We added data to every sub-component](https://github.com/contiamo/operational-visualizations/pull/96)
- We didn't touch scale hooks for now, let's see how it goes
- We undid some of premature optimisation and simplified code

## Consequences

N/A
