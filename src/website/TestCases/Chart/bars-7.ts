import { Chart } from "../../../";
import { Data, SeriesData } from "../../../Chart/typings";
import { MarathonEnvironment } from "../../Marathon";

const numberOfCharts = 10;

const StackedRenderer = {
  type: "stacked",
  stackAxis: "y",
  renderAs: [{ type: "bars" }],
};

const createData = (numberOfSeries: number): Data => {
  const data: Data = {
    series: [
      {
        series: [],
        renderAs: [StackedRenderer],
      },
    ],
    axes: {
      x1: {
        type: "time",
        start: new Date(2018, 2, 10),
        end: new Date(2018, 2, 17),
        interval: "day",
        title: "2018",
        rotateLabels: true,
      },
      y1: {
        type: "quant",
        title: "Total users",
      },
    },
  };

  for (let i = 0; i < numberOfSeries; i = i + 1) {
    (data.series as SeriesData)[0].series.push({
      data: [
        { x: new Date(2018, 2, 10), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 11), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 12), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 13), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 14), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 15), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 16), y: Math.floor(Math.random() * 500) },
        { x: new Date(2018, 2, 17), y: Math.floor(Math.random() * 500) },
      ],
      name: `Series ${i + 1}`,
      key: `series-${i + 1}`,
    });
  }

  return data;
};

export const marathon = ({ test, afterAll, container }: MarathonEnvironment): void => {
  const charts = new Array(20).fill(null).map(
    () =>
      new Chart(
        (() => {
          const el = document.createElement("div");
          container.appendChild(el);
          return el;
        })(),
      ),
  );

  test(`Render ${numberOfCharts} charts`, () => {
    charts.forEach(chart => {
      setTimeout(() => {
        chart.data(createData(10));
        chart.draw();
      }, 0);
    });
  });

  test(`Transition ${numberOfCharts} charts`, () => {
    charts.forEach(chart => {
      setTimeout(() => {
        chart.data(createData(10));
        chart.draw();
      }, 0);
    });
  });

  afterAll(() => {
    charts.forEach(chart => {
      chart.close();
    });
  });
};

export const title: string = `${numberOfCharts} charts`;

// Must match the file name so we can link to the code on GitHub
export const slug = "bars-7";
