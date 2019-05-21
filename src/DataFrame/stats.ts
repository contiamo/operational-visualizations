/**
 * TODO: change API of this module it is ugly
 */

import { IteratableFrame } from "./types";

export const weakMemoize = <A extends object, B>(func: (a: A) => B) => {
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
export const getQuantitiveStats: GetQuantitiveStats = weakMemoize(frame => {
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

type GetCategoricalStats = <Name extends string>(frame: IteratableFrame<Name>) => { unqiue: Record<Name, string[]> };

export const getCategoricalStats: GetCategoricalStats = weakMemoize(frame => {
  const categoricalColumns = frame.schema.filter(column => column.type === "string").map(column => column.name);
  const unqiue: Array<Set<string>> = categoricalColumns.map(_ => new Set<string>());

  frame.forEach(categoricalColumns, (...values) => {
    values.forEach((value, i) => {
      unqiue[i].add(value);
    });
  });

  return {
    unqiue: zip(categoricalColumns, unqiue.map(x => [...x])),
  };
});
