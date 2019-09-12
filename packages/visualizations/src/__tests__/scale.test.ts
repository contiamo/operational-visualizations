import { scaleBand, scaleLinear } from "d3-scale";
import { isScaleBand, isScaleContinious } from "../scale";

describe("isScaleBand()", () => {
  it("detects ScaleBand", () => {
    const scaleB = scaleBand().domain(["0", "1"]);
    const scaleL = scaleLinear().domain([0, 1]);
    expect(isScaleBand(scaleB)).toEqual(true);
    expect(isScaleBand(scaleL)).toEqual(false);
  });
});

describe("isScaleContinious()", () => {
  it("detects ScaleContinious", () => {
    const scaleB = scaleBand().domain(["0", "1"]);
    const scaleL = scaleLinear().domain([0, 1]);
    expect(isScaleContinious(scaleB)).toEqual(false);
    expect(isScaleContinious(scaleL)).toEqual(true);
  });
});
