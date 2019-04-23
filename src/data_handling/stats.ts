import { IteratableFrame } from "./types";

const cache = new WeakMap<
  IteratableFrame<any>,
  { min: Record<string, number>; max: Record<string, number>; sum: Record<string, number> }
>();

const zip = <A extends string, B>(a: A[], b: B[]) =>
  a.reduce(
    (acc, x, i) => {
      acc[x] = b[i];
      return acc;
    },
    {} as Record<A, B>,
  );

// For numerical data for now we get min, max. We can get mean, deviation distribution as well
export const getQuantitiveStats = <Name extends string>(
  frame: IteratableFrame<Name>,
): { min: Record<Name, number>; max: Record<Name, number>; sum: Record<Name, number> } => {
  if (!cache.has(frame)) {
    const quantitiveColumns = frame.schema.filter(column => column.type === "number").map(column => column.name);
    let max: number[] = [];
    let min: number[] = [];
    let sum: number[] = [];
    frame.forEach(quantitiveColumns, (...values) => {
      if (max.length === 0) {
        max = [...values];
        min = [...values];
        sum = [...values];
      } else {
        values.forEach((value, i) => {
          max[i] = Math.max(value, max[i]);
          min[i] = Math.min(value, min[i]);
          sum[i] = value + sum[i];
        });
      }
    });

    cache.set(frame, {
      min: zip(quantitiveColumns, min),
      max: zip(quantitiveColumns, max),
      sum: zip(quantitiveColumns, sum),
    });
  }

  return cache.get(frame) as any;
};

// For categorical data we can get number of unqiue items for example
// or distribution of values
