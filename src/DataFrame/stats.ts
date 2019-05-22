/**
 * There was attempt to optimize state for frame,
 * by iterating only twice over frame and calculate all values and memoise the result.
 * Not sure it is the optimal way.
 *
 * TODO: revise this later, as well revise `forEach` method,
 *  maybe it should return row the same way as `map` does.
 */

import { IteratableFrame } from "./types";

const weakMemoize = <A extends object, B>(func: (a: A) => B) => {
  const cache = new WeakMap();
  return (a: A) => {
    if (!cache.has(a)) {
      cache.set(a, func(a));
    }
    return cache.get(a) as B;
  };
};

const zip = <A extends string, B>(a: A[], b: B[]) =>
  a.reduce(
    (acc, x, i) => {
      acc[x] = b[i];
      return acc;
    },
    {} as Record<A, B>,
  );

type GetQuantitiveStats = <Name extends string>(
  frame: IteratableFrame<Name>,
) => { min: Record<Name, number>; max: Record<Name, number> };

// For numerical data for now we get min, max. We can get mean, deviation distribution as well
const getQuantitiveStats: GetQuantitiveStats = weakMemoize(frame => {
  const quantitiveColumns = frame.schema.filter(column => column.type === "number").map(column => column.name);
  let max: number[] = [];
  let min: number[] = [];

  frame.forEach(quantitiveColumns, (...values) => {
    if (max.length === 0) {
      max = [...values];
      min = [...values];
    } else {
      values.forEach((value, i) => {
        max[i] = Math.max(value, max[i]);
        min[i] = Math.min(value, min[i]);
      });
    }
  });

  return {
    min: zip(quantitiveColumns, min),
    max: zip(quantitiveColumns, max),
  };
});

type GetCategoricalStats = <Name extends string>(frame: IteratableFrame<Name>) => { unique: Record<Name, string[]> };

const getCategoricalStats: GetCategoricalStats = weakMemoize(frame => {
  const categoricalColumns = frame.schema.filter(column => column.type === "string").map(column => column.name);
  const unique: Array<Set<string>> = categoricalColumns.map(() => new Set<string>());

  frame.forEach(categoricalColumns, (...values) => {
    values.forEach((value, i) => {
      unique[i].add(value);
    });
  });

  return {
    unique: zip(categoricalColumns, unique.map(x => [...x])),
  };
});

export const uniqueValues = <Name extends string>(frame: IteratableFrame<Name>, column: Name): string[] => {
  return getCategoricalStats(frame).unique[column];
};

export const maxValue = <Name extends string>(frame: IteratableFrame<Name>, column: Name): number => {
  return getQuantitiveStats(frame).max[column];
};
