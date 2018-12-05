import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"
import Axis from "../../src/Axis/Axis"
import ComputeCategoricalAxes from "../../src/axis_utils/compute_categorical_axes"
import ComputeQuantAxes from "../../src/axis_utils/compute_quant_axes"

const containerNode = document.getElementById("app")

// const x1: Props = {
//   length: 100,
//   width: 40,
//   ticks: [
//     { value: "0", position: 0, class: "zero" },
//     { value: "500", position: 50 },
//     { value: "1000", position: 100 },
//   ],
//   axis: "x1",
//   tickLength: 5,
// }

// const x2: Props = {
//   length: 100,
//   width: 40,
//   ticks: [
//     { value: "0", position: 0, class: "zero" },
//     { value: "500", position: 50 },
//     { value: "1000", position: 100 },
//   ],
//   axis: "x2",
//   tickLength: 5,
// }

// const y1: Props = {
//   length: 100,
//   width: 40,
//   ticks: [
//     { value: "0", position: 100, class: "zero" },
//     { value: "500", position: 50 },
//     { value: "1000", position: 0 },
//   ],
//   axis: "y1",
//   tickLength: 5,
// }

// const y2: Props = {
//   length: 100,
//   width: 40,
//   ticks: [
//     { value: "0", position: 100, class: "zero" },
//     { value: "500", position: 50 },
//     { value: "1000", position: 0 },
//   ],
//   axis: "y2",
//   tickLength: 5,
// }

const categorical = ComputeCategoricalAxes({
  y1: {
    range: [600, 0],
    values: ["Alpha", "Bravo", "Charlie", "Delta"],
    options: {
      type: "categorical",
      values: ["Alpha", "Bravo", "Charlie", "Delta"],
    }
  }
}).y1

const quantX = ComputeQuantAxes({
  x1: {
    range: [0, 600],
    values: [1,2,3,4,5,6,7,8,9],
    options: {
      type: "quant"
    }
  },
  x2: {
    range: [0, 600],
    values: [10, 20, 30, 40, 50],
    options: {
      type: "quant"
    }
  }
})

const quantY = ComputeQuantAxes({
  y1: {
    range: [500, 0],
    values: [1,2,3,4,5,6,7,8,9],
    options: {
      type: "quant"
    }
  },
  y2: {
    range: [500, 0],
    values: [10, 20, 30, 40, 50],
    options: {
      type: "quant"
    }
  }
})

const App = () => (
  <OperationalUI>
    <Axis position={"x1"} data={quantX.x1} width={75} margins={"0 5px"}/>
    <Axis position={"x2"} data={quantX.x2} width={75} margins={"0 10px"}/>
    <Axis position={"y1"} data={quantY.y1} width={75} margins={"10px"}/>
    <Axis position={"y2"} data={quantY.y2} width={75} margins={"5px 0"}/>
    <Axis position={"y1"} data={categorical} width={50} margins={"0"}/>
  </OperationalUI>
)

render(<App />, containerNode)
