import { numberFormatter, removeTrailingZeros } from "../utils";

describe("numberFormatter()", () => {
  it("formats numbers correctly", () => {
    expect(numberFormatter(123456)).toEqual("123,456");
    expect(numberFormatter(123456.789)).toEqual("123,457");
    expect(numberFormatter(12.3456)).toEqual("12.3");
    expect(numberFormatter(0)).toEqual("0");
    expect(numberFormatter(0.0)).toEqual("0");
    expect(numberFormatter(-12.3456)).toEqual("-12.3");
    expect(numberFormatter(1.23456)).toEqual("1.23");
    expect(numberFormatter(5)).toEqual("5");
    expect(numberFormatter(0.123456)).toEqual("0.123");
  });
});

describe("removeTrailingZeros()", () => {
  it("removes trailing zeros", () => {
    expect(removeTrailingZeros("123.45000")).toEqual("123.45");
    expect(removeTrailingZeros("123.00000")).toEqual("123");
    expect(removeTrailingZeros("12345000")).toEqual("12345");
  });
});
