import { scaleBand, scaleLinear } from "d3-scale";
import { isScaleBand, isScaleContinuous } from "../scale";

describe("isScaleBand()", () => {
  it("detects ScaleBand", () => {
    const scaleB = scaleBand().domain(["0", "1"]);
    const scaleL = scaleLinear().domain([0, 1]);
    expect(isScaleBand(scaleB)).toEqual(true);
    expect(isScaleBand(scaleL)).toEqual(false);
  });
});

describe("isScaleContinuous()", () => {
  it("detects ScaleContinuous", () => {
    const scaleB = scaleBand().domain(["0", "1"]);
    const scaleL = scaleLinear().domain([0, 1]);
    expect(isScaleContinuous(scaleB)).toEqual(false);
    expect(isScaleContinuous(scaleL)).toEqual(true);
  });
});
