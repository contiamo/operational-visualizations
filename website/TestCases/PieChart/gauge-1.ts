import { PieChart } from "../../../src"
import { MarathonEnvironment } from "../../Marathon"

const GaugeRenderer = {
  type: "gauge",
  extent: "semi",
  target: 50,
}

const data = {
  data: [{ key: "Berlin", value: 35 }],
  renderAs: [GaugeRenderer],
}

const data1 = {
  data: [{ key: "Berlin", value: 14 }],
  renderAs: [GaugeRenderer],
}

const data2 = {
  data: [{ key: "Berlin", value: 72 }],
  renderAs: [GaugeRenderer],
}

const data3 = {
  data: [{ key: "Berlin", value: 41 }],
  renderAs: [GaugeRenderer],
}

export const marathon = ({ test, afterAll, container }: MarathonEnvironment): void => {
  const viz = new PieChart(container)

  test("Renders the chart", () => {
    viz.data(data)
    viz.draw()
  })

  test("Updates the data", () => {
    viz.data(data1)
    viz.draw()
  })

  test("Updates the data (value > target)", () => {
    viz.data(data2)
    viz.draw()
  })

  test("Updates the data", () => {
    viz.data(data3)
    viz.draw()
  })

  afterAll(() => {
    viz.close()
  })
}

export const title = "Updates (semi)"

// Must match the file name so we can link to the code on GitHub
export const slug = "gauge-1"
