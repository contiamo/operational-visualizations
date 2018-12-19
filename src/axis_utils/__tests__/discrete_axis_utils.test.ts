import { scaleBand, scaleTime } from "d3-scale";
import { keys, last } from "lodash/fp";
import { adjustRange as adjustCategoricalRange } from "../compute_categorical_axes";
import { adjustRange as adjustTimeRange } from "../compute_time_axes";
import { computeBarPositions, computeRuleTicks, computeTickWidth } from "../discrete_axis_utils";
import { DiscreteInputDatum } from "../typings";

describe("discrete axis utils", () => {
  const config = {
    outerBarSpacing: 20,
    innerBarSpacing: 10,
    minBarWidth: 5,
  };

  describe("computeBarPositions", () => {
    describe("No defined widths, no stacks", () => {
      const barSeries = {
        series1: { index: 0 },
        series2: { index: 1 },
        series3: { index: 2 },
      };
      const barPositions = computeBarPositions([500, 1000], 5, config, barSeries);
      const seriesKeys = keys(barSeries);
      expect(seriesKeys.map(barPositions.width)).toEqual([20, 20, 20]);
      expect(seriesKeys.map(barPositions.offset)).toEqual([-40, -10, 20]);
    });

    describe("Some defined widths, no stacks", () => {
      const barSeries = {
        series1: { index: 0 },
        series2: { index: 1, barWidth: 30 },
        series3: { index: 2 },
      };
      const barPositions = computeBarPositions([500, 1000], 5, config, barSeries);
      const seriesKeys = keys(barSeries);
      expect(seriesKeys.map(barPositions.width)).toEqual([15, 30, 15]);
      expect(seriesKeys.map(barPositions.offset)).toEqual([-40, -15, 25]);
    });

    describe("Range too small", () => {
      const barSeries = {
        series1: { index: 0 },
        series2: { index: 1, barWidth: 30 },
        series3: { index: 2 },
      };
      const barPositions = computeBarPositions([100, 200], 5, config, barSeries);
      const seriesKeys = keys(barSeries);
      expect(seriesKeys.map(barPositions.width)).toEqual([5, 30, 5]);
      expect(seriesKeys.map(barPositions.offset)).toEqual([-30, -15, 25]);
    });

    describe("Some stacks, negative range", () => {
      const barSeries = {
        series1: { index: 0 },
        series2: { index: 1, barWidth: 30, stackIndex: 1 },
        series3: { index: 1, barWidth: 25, stackIndex: 1 },
      };
      const barPositions = computeBarPositions([1000, 500], 5, config, barSeries);
      const seriesKeys = keys(barSeries);
      expect(seriesKeys.map(barPositions.width)).toEqual([40, 30, 30]);
      expect(seriesKeys.map(barPositions.offset)).toEqual([-40, 10, 10]);
    });
  });

  it("computeTickWidth", () => {
    expect(computeTickWidth([50, 100], 5, false)).toEqual(0);
    expect(computeTickWidth([50, 100], 5, true)).toEqual(10);
    expect(computeTickWidth([100, 50], 5, true)).toEqual(10);
  });

  describe("computeRuleTicks, categorical axis", () => {
    const createData = (showRules: boolean, hasBars: boolean) => {
      const datum: DiscreteInputDatum = {
        range: [100, 500],
        values: ["A", "B", "C", "D"],
        options: { showRules },
        hasBars,
      };
      const adjustedRange = adjustCategoricalRange(datum);
      const scale = scaleBand()
        .range(adjustedRange)
        .domain(datum.values);
      return { datum, scale };
    };

    it("no rules", () => {
      const data = createData(false, true);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([]);
    });
    it("rules, no bars", () => {
      const data = createData(true, false);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([
        { position: 150 },
        { position: 250 },
        { position: 350 },
        { position: 450 },
      ]);
    });
    it("rules, bars", () => {
      const data = createData(true, true);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([
        { position: 200 },
        { position: 300 },
        { position: 400 },
      ]);
    });
  });

  describe("computeRuleTicks, time axis", () => {
    const createData = (showRules: boolean, hasBars: boolean) => {
      const datum: DiscreteInputDatum = {
        range: [400, 100],
        values: [new Date("05-10-2018"), new Date("05-11-2018"), new Date("05-12-2018")],
        options: { showRules },
        hasBars,
      };
      const adjustedRange = adjustTimeRange(datum);
      const scale = scaleTime()
        .range(adjustedRange)
        .domain([datum.values[0], last(datum.values)]);
      return { datum, scale };
    };

    it("no rules", () => {
      const data = createData(false, true);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([]);
    });
    it("rules, no bars", () => {
      const data = createData(true, false);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([
        { position: 400 },
        { position: 250 },
        { position: 100 },
      ]);
    });
    it("rules, bars", () => {
      const data = createData(true, true);
      expect(computeRuleTicks(data.datum, data.scale)).toEqual([{ position: 300 }, { position: 200 }]);
    });
  });
});
