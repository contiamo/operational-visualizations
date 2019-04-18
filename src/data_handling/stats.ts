import { IteratableFrame } from "./types";

const cache = new WeakMap<
  IteratableFrame<any>,
  { min: Array<Record<string, number>>; max: Array<Record<string, number>> }
>();

const zip = <A extends string, B>(a: A[], b: B[]) => a.map((x, i) => ({ [x]: b[i] } as Record<A, B>));

// For numerical data for now we get min, max. We can get mean, deviation distribution as well
export const getQuantitiveStats = <Name extends string>(
  frame: IteratableFrame<Name>,
): { min: Record<Name, number>; max: Record<Name, number> } => {
  if (!cache.has(frame)) {
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
    cache.set(frame, { min: zip(quantitiveColumns, min), max: zip(quantitiveColumns, max) });
  }

  return cache.get(frame) as any;
};

// For categorical data we can get number of unqiue items for example
// or distribution of values
