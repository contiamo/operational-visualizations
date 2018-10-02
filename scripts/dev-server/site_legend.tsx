import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"
import theme from "../../src/utils/constants"

const containerNode = document.getElementById("app")

import Legend from "../../src/Legend/Legend"

const palette = theme.palettes.qualitative.operational

const data = [
  { key: "a", label: "A", color: palette[0] },
  { key: "b", label: "B", color: palette[1] },
  { key: "c", label: "C", color: palette[2] },
  { key: "d", label: "D", color: palette[3] },
  { key: "e", label: "E", color: palette[4] },
  { key: "f", label: "F", color: palette[5] }
]

const palette2 = theme.palettes.qualitative.pastel

const data2 = [
  { key: "bln", label: "Berlin", color: palette2[0] },
  { key: "ldn", label: "London", color: palette2[1] },
  { key: "nyc", label: "New York", color: palette2[2] },
  { key: "par", label: "Paris", color: palette2[3] },
  { key: "tok", label: "Tokyo", color: palette2[4] },
]

const App = () => (
  <OperationalUI>
    <Legend data={data} title={"Title"}/>
    <Legend data={data2} style={{ width: 150 }}/>
  </OperationalUI>
)

render(<App />, containerNode)
