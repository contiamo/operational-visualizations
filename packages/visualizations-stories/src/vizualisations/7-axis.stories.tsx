import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  Axis,
  // AxisRules,
  Chart,
  AxisRules,
} from "@operational/visualizations";
import { scaleLinear, scaleBand } from "d3-scale";

/**
 * Example of how you can compose more complex charts out of 'atoms'
 */

storiesOf("@operational/visualizations/7. Axis", module)
  .add("linear axes", () => {
    const scale = (flipped: boolean) =>
      scaleLinear()
        .domain([0, 300])
        .range(flipped ? [300, 0] : [0, 300]);
    return (
      <Chart width={300} height={300} margin={60}>
        <Axis scale={scale(true)} position="left" />
        <Axis scale={scale(true)} position="right" />
        <Axis scale={scale(false)} position="top" />
        <Axis scale={scale(false)} position="bottom" />
        <AxisRules scale={scale(true)} position="left" length={300} />
        <AxisRules scale={scale(false)} position="top" length={300} />
      </Chart>
    );
  })
  .add("categorical axes", () => {
    const scale = (flipped: boolean) =>
      scaleBand()
        .domain(["A", "B", "C", "D", "E", "F", "G"])
        .range(flipped ? [300, 0] : [0, 300]);
    return (
      <Chart width={300} height={300} margin={60}>
        <Axis scale={scale(true)} position="left" />
        <Axis scale={scale(true)} position="right" />
        <Axis scale={scale(false)} position="top" />
        <Axis scale={scale(false)} position="bottom" />
        <AxisRules scale={scale(true)} position="left" length={300} />
        <AxisRules scale={scale(false)} position="top" length={300} />
      </Chart>
    );
  })
  .add("categorical axes, some ticks hidden", () => {
    const scale = (flipped: boolean) =>
      scaleBand()
        .domain([
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
        ])
        .range(flipped ? [300, 0] : [0, 300]);
    return (
      <Chart width={300} height={300} margin={60}>
        <Axis scale={scale(true)} position="left" maxNumberOfTicks={5} />
        <Axis scale={scale(true)} position="right" maxNumberOfTicks={8} />
        <Axis scale={scale(false)} position="top" maxNumberOfTicks={10} />
        <Axis scale={scale(false)} position="bottom" maxNumberOfTicks={15} />
        <AxisRules scale={scale(true)} position="left" length={300} />
        <AxisRules scale={scale(false)} position="top" length={300} />
      </Chart>
    );
  })
  .add("categorical axes, truncated labels", () => {
    const scale = (flipped: boolean) =>
      scaleBand()
        .domain(["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet"])
        .range(flipped ? [300, 0] : [0, 300]);
    return (
      <Chart width={300} height={300} margin={60}>
        <Axis scale={scale(true)} position="left" maxNumberOfTicks={20} />
        <Axis scale={scale(true)} position="right" maxNumberOfTicks={20} />
        <Axis scale={scale(false)} position="top" maxNumberOfTicks={20} />
        <Axis scale={scale(false)} position="bottom" maxNumberOfTicks={20} />
        <AxisRules scale={scale(true)} position="left" length={300} />
        <AxisRules scale={scale(false)} position="top" length={300} />
      </Chart>
    );
  });
