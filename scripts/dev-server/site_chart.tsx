import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"

const containerNode = document.getElementById("app")

import Chart from "../../src/Chart/facade"
import { VisualizationWrapper } from "../../src/index"

import computeQuantAxes from "../../src/axis_utils/compute_quant_axes"
import computeTimeAxes from "../../src/axis_utils/compute_time_axes"

import { mapValues } from "lodash/fp"

const AreaRenderer: any = {
  accessors: {
    interpolate: (series: any, d: any) => "monotoneX",
  },
  type: "area",
}

const LineRenderer: any = {
  accessors: {
    interpolate: (series: any, d: any) => "monotoneX",
  },
  type: "line",
}

const BarsRenderer: any = {
  type: "bars",
}

const SymbolRenderer: any = {
  accessors: {
    symbol: (series: any, d: any) => (d.y >= 1000 ? "cross" : "diamond"),
    size: (series: any, d: any) => (series.key() === "series2" ? 150 : 60),
    fill: () => "#bbb",
  },
  type: "symbol",
}

const TextRenderer: any = {
  type: "text",
  config: {
    offset: 5,
  },
}

const StackedRenderer = {
  type: "stacked",
  renderAs: [BarsRenderer, TextRenderer],
}

const X1FlagRenderer = {
  type: "flag",
  config: {
    axis: "x1",
  },
}

const X2FlagRenderer = {
  type: "flag",
  config: {
    axis: "x2",
  },
}

const Y1FlagRenderer = {
  type: "flag",
  config: {
    axis: "y1",
  },
}

const Y2FlagRenderer = {
  type: "flag",
  config: {
    axis: "y2",
  },
}

const RangeRenderer = {
  type: "range",
  renderAs: [AreaRenderer, LineRenderer, SymbolRenderer],
}

// const data = {
//   series: [
//     {
//       data: [
//         { x: new Date(2018, 2, 10), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 11), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 12), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 13), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 14), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 15), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 16), y: Math.floor(Math.random() * 500) - 250 },
//         { x: new Date(2018, 2, 11), y: Math.floor(Math.random() * 500) - 250 },
//       ],
//       name: "Pageviews 2018",
//       key: "series1",
//       renderAs: [TextRenderer, BarsRenderer],
//     },
//     {
//       data: [
//         { x: new Date(2018, 2, 10), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 11), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 12), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 13), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 14), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 15), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 16), y: Math.floor(Math.random() * 300) - 150 },
//         { x: new Date(2018, 2, 11), y: Math.floor(Math.random() * 300) - 150 },
//       ],
//       name: "Users 2018",
//       key: "series2",
//       renderAs: [TextRenderer, BarsRenderer],
//     },
//     {
//       series: [
//         {
//           data: [
//             { y: new Date(2018, 2, 10), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 11), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 12), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 13), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 14), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 15), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 16), x: Math.floor(Math.random() * 200 + 1000) },
//           ],
//           name: "Metric 1",
//           key: "series3",
//           datumAccessors: {
//             x: (d: any) => d.y,
//             y: (d: any) => d.x,
//           },
//           yAxis: "y2",
//         },
//         {
//           data: [
//             { y: new Date(2018, 2, 10), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 11), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 12), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 13), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 14), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 15), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 16), x: Math.floor(Math.random() * 200 + 1000) },
//             { y: new Date(2018, 2, 11), x: Math.floor(Math.random() * 200 + 1000) },
//           ],
//           name: "Metric 2",
//           key: "series4",
//           datumAccessors: {
//             x: (d: any) => d.y,
//             y: (d: any) => d.x,
//           },
//           yAxis: "y2",
//         },
//       ],
//       renderAs: [StackedRenderer],
//     },
//     {
//       data: [
//         {
//           y: 400,
//           label: "Event 3",
//           description:
//             "Insert very long, long, long description here to see how the labels wrap when the description is very long.",
//         },
//       ],
//       name: "Event flags",
//       key: "flagsY1",
//       hideInLegend: true,
//       renderAs: [Y1FlagRenderer],
//     },
//     {
//       data: [
//         {
//           y: 2000,
//           label: "Event 4",
//           description:
//             "Insert very long, long, long description here to see how the labels wrap when the description is very long.",
//         },
//       ],
//       name: "Event flags",
//       key: "flagsY2",
//       hideInLegend: true,
//       renderAs: [Y2FlagRenderer],
//     },
//   ],
//   axes: {
//     x1: {
//       type: "categorical",
//       start: new Date(2018, 2, 10),
//       end: new Date(2018, 2, 17),
//       interval: "day",
//       title: "2018",
//     },
//     y1: {
//       type: "quant",
//       title: "TEST",
//     },
//     y2: {
//       type: "quant",
//     },
//   },
// }

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
  axes: (mapValues as any)(computed => ({ type: "computed", computed }))({
    ...(computeTimeAxes({
      x1: {
        range: [0, 694],
        values: [],
        options: {
          type: "time",
          start: new Date(2018, 2, 10),
          end: new Date(2018, 2, 15),
          interval: "day",
          hideAxis: true,
          margin: 3,
        }
      },
      x2: {
        range: [0, 694],
        values: [],
        options: {
          type: "time",
          start: new Date(2017, 2, 10),
          end: new Date(2017, 2, 15),
          interval: "day",
          hideAxis: true,
          margin: 3,
        }
      }
    }, {
      barSeries: {
        series1: {
          barWidth: 20
        }, series2: {
          barWidth: 50
        }
      },
      barIndices: {
        series1: 0,
        series2: 1
      }
    })),
    ...(computeQuantAxes({
      y1: {
        range: [494, 0],
        values: [100, 300, 500, 300, 200, 500, 450, 250, 425, 570],
        options: {
          type: "quant",
          hideAxis: true,
          margin: 3
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
        width: 700,
        legend: false,
        noAxisMargin: 3
      }}
    />
  </OperationalUI>
)

render(<App />, containerNode)
