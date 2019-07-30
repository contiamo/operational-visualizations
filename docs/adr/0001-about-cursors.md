# 1. about-cursors

Date: 2019-07-08

## Status

2019-07-08 proposed

## Context

In the grid in cell function we recieve `FragmentFrame` which is vertical slice of original `DataFrame` and then when we render visualaisation we iterate through raw data with `mapRows` method of `IterableFrame` and then we need to access some exact value in raw row. One of the ideas on how to do this universally was to use some kind of **cursor**.

Current implementation of **cursor** looks like this

```tsx
export interface ColumnCursor<Name extends string, ValueInRawRow = any> {
  (row: RowCursor): ValueInRawRow;
  column: Name;
  index: number;
}
```

so we can access value like this `cursor(row)` or more hacky and optimised way `row[cursor.index]`. Second option is fragile, in case we would want to change implementation of `row` (for example, from row-oriented storage to column-orinted) it will brake in many places (at least we have types, which will make this refactoring easier).

Cursor at the moment can be recieved from "root" `DataFrame`, which we think of as source of all derivative `PivotFrame`s and `FragmentFrame`s. Cursors are cached for referential transparency, so if they got passed down to React components, they will not trigger rerender.

**Question** raised in [one of PR](https://github.com/contiamo/operational-visualizations/pull/70/files#diff-2044c7c7ba6c3fbf04dd49cf3cfa68b9R38): Shall we provide `getCursor` functionality in `FragmentFrame`? From one side it may make code simpler, on the other side we need to make sure that `FragmentFrame`s are referentially transperent (which is not the case, for example, for `cell` method) and it will create a lot of copies of the same cursors. We can as well pass reference to "root" `DataFrame` along all derivative structures and "proxy" `getCursor` method call to it.

## Decision

At the moment we decided to use proposed version of cursors and adjust it in the future depending if we like DX or not. We will provide `getCursor` method only for `DataFrame` for now, but we can chnage this in the future.

## Consequences

This decision mainly affects DX. And it is hard to foresee, without trying out in real project
