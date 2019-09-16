# 6. static-vs-dynamic-check

Date: 2019-09-13

## Status

2019-09-13 proposed

## Context

We tried to employ type system to prevent wrong combination of options for charts. For examples, bar chart expects one band and one continious scale:

```ts
export type BaseAxialChartProps<Name extends string> =
  | {
      xScale: ScaleBand<string>;
      yScale: ScaleLinear<number, number>;
    }
  | {
      xScale: ScaleLinear<number, number>;
      yScale: ScaleBand<string>;
    };
```

But this won't work, because TS can't work with disjoint union without actual discriminant, so we need to add tag (`metricDirection`):

```ts
export type BaseAxialChartProps<Name extends string> =
  | {
      metricDirection: "vertical";
      xScale: ScaleBand<string>;
      yScale: ScaleLinear<number, number>;
    }
  | {
      metricDirection: "horizontal";
      xScale: ScaleLinear<number, number>;
      yScale: ScaleBand<string>;
    };
```

But this resulted in clumsy code, which we refactored down to:

```ts
export type BaseAxialChartProps<Name extends string> = {
  metricDirection: "vertical" | "horizontal";
  categorical: ScaleBand<string>;
  metric: ScaleLinear<number, number>;
};
```

Which was ok-ish, except it confuses people who are not familiar with terminology (categorical, metric values). But then we got to scatter plot, which can take any combination of scales:

```tsx
export interface DotsProps<Name extends string> {
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
}
```

And now we want to refactor all chart to have consistent interface, so it would be easy to interchange them.

Pretty similar thing happens in `PivotGrid`:

```tsx
/**
 * We support text only pivot grid out of the box,
 * for this case you don't need to provide cell render prop, but you need to provide measures
 */
type TextOnlyPivotGridProps<Name extends string> =
  | {
      type?: "text";
      rowMeasures: Name[];
      columnMeasures?: undefined;
    }
  | {
      type?: "text";
      rowMeasures?: undefined;
      columnMeasures: Name[];
    };

/**
 * This is props for general PivotGrid, you need to provide cell render prop.
 * It can return any React component which will be rendered in cells
 */
type GeneralPivotGridProps<Name extends string> =
  | {
      type: "general";
      cell: (prop: CellPropsWithoutMeasure<Name>) => React.ReactElement | null;
    }
  | {
      type: "generalWithMeasures";
      rowMeasures?: Name[];
      columnMeasures?: Name[];
      cell: (prop: CellPropsWithMeasure<Name>) => React.ReactElement | null;
    };
```

`type` is a tag for the disjoint union, which defines what combinations of parameters is supported. The problem is that it generates very confusing TypeScript errors, because it has huge type signature:

```tsx
type Props<Name extends string = string> = (TextOnlyPivotGridProps<Name> | GeneralPivotGridProps<Name>) & {
  ...
}
```

## Decision

We want to avoid a static check and instead rely on dynamic type checking for charts:

```tsx
export const Bars: DiscreteAxialChart<string> = ({ xScale, yScale }) => {
  if (isScaleBand(xScale) && isScaleContinuous(yScale)) {
    return <g>{bars}</g>;
  } else if (isScaleBand(yScale) && isScaleContinuous(xScale)) {
    return <g>{bars}</g>;
  } else {
    throw new Error("Unsupported case of scales");
  }
};
```

There is a chance that the visualisation can crash at runtime in the user's face. We can be more graceful about this and replace `throw` with `return "Error"` in production mode.

Maybe later we will do the same change for `PivotGrid`.

## Consequences

The decision mainly affects DX. It is hard to foresee consequences without trying out in a real project
