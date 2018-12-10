import { adjustRange } from "../compute_categorical_axes"
import { CategoricalAxisOptions } from "../typings";

describe("compute categorical axes", () => {
  describe("adjustRange", () => {
    const options: CategoricalAxisOptions = {type: "categorical", values: ["A", "B", "C", "D", "E", "F"] }
    it("no bars", () => {
      expect(adjustRange({
        range: [0, 300],
        values: options.values,
        hasBars: false,
        options
      })).toEqual([25, 325])
    })
    it("bars, positive range", () => {
      expect(adjustRange({
        range: [0, 300],
        values: options.values,
        hasBars: true,
        options
      })).toEqual([25, 325])
    })
    it("bars, negative range", () => {
      expect(adjustRange({
        range: [-300, 0],
        values: options.values,
        hasBars: true,
        options
      })).toEqual([-275, 25])
    })
  })
})
