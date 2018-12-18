import { PieChart } from "../../../";
import { Data, RendererOptions } from "../../../PieChart/typings";
import { MarathonEnvironment } from "../../Marathon";

const DonutRenderer: RendererOptions = {
  type: "donut",
};

const data: Data = {
  data: [{ key: "Berlin" }, { key: "Dortmund" }, { key: "Bonn" }, { key: "Cologne" }],
  renderAs: [DonutRenderer],
};

const data1: Data = {
  data: [
    { key: "Berlin", value: 0 },
    { key: "Dortmund", value: 0 },
    { key: "Bonn", value: 0 },
    { key: "Cologne", value: 0 },
  ],
  renderAs: [DonutRenderer],
};

export const marathon = ({ test, afterAll, container }: MarathonEnvironment): void => {
  const viz = new PieChart(container);

  test("Renders the chart with an empty dataset", () => {
    viz.data({ data: [], renderAs: [DonutRenderer] });
    viz.draw();
  });

  test("Renders the chart with no values", () => {
    viz.data(data);
    viz.draw();
  });

  test("Renders the chart with only 0 values", () => {
    viz.data(data1);
    viz.draw();
  });

  afterAll(() => {
    viz.close();
  });
};

export const title = "Empty/no data";

// Must match the file name so we can link to the code on GitHub
export const slug = "general-1";
