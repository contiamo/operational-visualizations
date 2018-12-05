import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"

const containerNode = document.getElementById("app")

import Chart from "../../src/Chart/facade"
import { VisualizationWrapper } from "../../src/index"

import computeQuantAxes from "../../src/axis_utils/compute_quant_axes"
import computeTimeAxes from "../../src/axis_utils/compute_time_axes"

import { mapValues } from "lodash/fp"

const BarsRenderer: any = {
  type: "bars",
  accessors: {
    barWidth: (series) => series.key() === "series1" ? 20 : 50
  }
}


const data: any = {
  series: [
    {
      data: [
        { x: new Date(2018, 2, 11), y: 100 },
        { x: new Date(2018, 2, 12), y: 300 },
        { x: new Date(2018, 2, 13), y: 500 },
        { x: new Date(2018, 2, 14), y: 300 },
        { x: new Date(2018, 2, 15), y: 200 },
      ],
      name: "Pageviews 2018",
      key: "series1",
      renderAs: [BarsRenderer],
    },
    {
      data: [
        { x: new Date(2017, 2, 10), y: 500 },
        { x: new Date(2017, 2, 11), y: 450 },
        { x: new Date(2017, 2, 12), y: 250 },
        { x: new Date(2017, 2, 13), y: 425 },
        { x: new Date(2017, 2, 14), y: 570 },
      ],
      name: "Pageviews 2017",
      xAxis: "x2",
      key: "series2",
      renderAs: [BarsRenderer],
    },
  ],
  // axes: {
  //   x1: {
  //     type: "time",
  //     start: new Date(2018, 2, 10),
  //     end: new Date(2018, 2, 15),
  //     interval: "day",
  //   },
  //   x2: {
  //     type: "time",
  //     start: new Date(2017, 2, 10),
  //     end: new Date(2017, 2, 15),
  //     interval: "day",
  //   },
  //   y1: { type: "quant" }
  // }
  axes: (mapValues as any)(computed => ({ type: "computed", computed }))({
    ...(computeTimeAxes({
      x1: {
        range: [0, 500],
        values: [],
        hasBars: true,
        options: {
          type: "time",
          start: new Date(2018, 2, 10),
          end: new Date(2018, 2, 15),
          interval: "day",
          // hideAxis: true,
          // margin: 3,
        }
      },
      x2: {
        range: [0, 500],
        values: [],
        hasBars: false,
        options: {
          type: "time",
          start: new Date(2017, 2, 10),
          end: new Date(2017, 2, 15),
          interval: "day",
          // hideAxis: true,
          // margin: 3,
        }
      }
    })),
    ...(computeQuantAxes({
      y1: {
        range: [455, 0],
        values: [100, 300, 500, 300, 200, 500, 450, 250, 425, 570],
        options: {
          type: "quant",
          // hideAxis: true,
          // margin: 3
        }
      }
    }))
  }),
}

const App = () => (
  <OperationalUI>
    <VisualizationWrapper
      facade={Chart}
      data={data}
      config={{
        backgroundColor: "#ddd",
        width: 700,
        legend: false,
        noAxisMargin: 3
      }}
    />
  </OperationalUI>
)

render(<App />, containerNode)
