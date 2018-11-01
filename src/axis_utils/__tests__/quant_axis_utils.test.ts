import { guess } from "../compute_quant_axes"

describe("quant axis utils", () => {
  it("guess", () => {
    expect(guess([])).toEqual([0, 100])
    expect(guess([NaN, undefined, null])).toEqual([0, 100])
    expect(guess([0, 0, 0])).toEqual([0, 100])
    expect(guess([5, 5, 5])).toEqual([0, 10])
    expect(guess([10, 20, 30])).toEqual([0, 30])
    expect(guess([-23, 40, 2])).toEqual([-23, 40])
    expect(guess([-23, -13, -18])).toEqual([-23, 0])
  })
})
