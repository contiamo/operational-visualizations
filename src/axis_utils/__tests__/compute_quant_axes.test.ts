import { computeDomain, containsZero, extentCushion, guess } from "../compute_quant_axes";

describe("compute quant axes", () => {
  it("computeDomain", () => {
    expect(computeDomain([])).toEqual([0, 105]);
    expect(computeDomain([500])).toEqual([0, 1050]);
    expect(computeDomain([-500])).toEqual([-1050, 0]);
    expect(computeDomain([500, -300, 20])).toEqual([-340, 540]);
  });

  it("extentCushion", () => {
    expect(extentCushion([0, 500])).toEqual([0, 525]);
    expect(extentCushion([-300, 0])).toEqual([-315, 0]);
    expect(extentCushion([400, 500])).toEqual([395, 505]);
  });

  it("guess", () => {
    expect(guess([])).toEqual([0, 100]);
    expect(guess([NaN, undefined, null])).toEqual([0, 100]);
    expect(guess([0, 0, 0])).toEqual([0, 100]);
    expect(guess([5, 5, 5])).toEqual([0, 10]);
    expect(guess([10, 20, 30])).toEqual([0, 30]);
    expect(guess([-23, 40, 2])).toEqual([-23, 40]);
    expect(guess([-23, -13, -18])).toEqual([-23, 0]);
  });

  it("containsZero", () => {
    expect(containsZero([0, 100, 20])).toEqual([0, 5]);
    expect(containsZero([-200, 100, 20])).toEqual([10, 5]);
    expect(containsZero([-200, 0, 20])).toEqual([10, 0]);
    expect(containsZero([50, 150, 10])).toEqual(undefined);
    expect(containsZero([-50, -150, -10])).toEqual(undefined);
  });
});
