import { Chart } from "../../../";
import { AxesData, Data } from "../../../Chart/typings";
import { MarathonEnvironment } from "../../Marathon";

const BarRenderer = {
  type: "bars",
};

const axes: AxesData = {
  x1: {
    type: "categorical",
    values: ["Berlin", "Bonn", "Cologne", "Dortmund"],
    title: "Country: Germany",
  },
  y1: {
    type: "quant",
    title: "New users",
  },
};

const data: Data = {
  axes,
  series: [{}],
};

const data1: Data = {
  axes,
  series: [
    {
      key: "series1",
      data: [{ x: "Berlin" }, { x: "Dortmund" }, { x: "Bonn" }, { x: "Cologne" }],
      renderAs: [BarRenderer],
    },
  ],
};

const data2: Data = {
  axes,
  series: [
    {
      key: "series1",
      data: [{ x: "Berlin", y: 0 }, { x: "Dortmund", y: 0 }, { x: "Bonn", y: 0 }, { x: "Cologne", y: 0 }],
      renderAs: [BarRenderer],
    },
  ],
};

export const marathon = ({ test, afterAll, container }: MarathonEnvironment): void => {
  const viz = new Chart(container);

  test("Renders the chart with an empty dataset", () => {
    viz.data(data);
    viz.draw();
  });

  test("Renders the chart with only missing data", () => {
    viz.data(data1);
    viz.draw();
  });

  test("Renders the chart with only 0 values", () => {
    viz.data(data2);
    viz.draw();
  });

  afterAll(() => {
    viz.close();
  });
};

export const title: string = "Empty/no data";

// Must match the file name so we can link to the code on GitHub
export const slug = "general-1";
