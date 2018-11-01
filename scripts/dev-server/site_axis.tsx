import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"
import Axis, { CategoricalProps, QuantProps } from "../../src/Axes/Axis"

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

const categorical: CategoricalProps = {
  type: "categorical",
  range: [200, 600],
  values: ["Alpha", "Bravo", "Charlie", "Delta"],
  axis: "y1",
  tickWidth: 70,
}

const quant: QuantProps = {
  type: "quant",
  range: [100, 600],
  domain: [7, 193],
  axis: "x1",
}

const App = () => (
  <OperationalUI>
    <Axis {...categorical} />
    <Axis {...quant} />
  </OperationalUI>
)

render(<App />, containerNode)
