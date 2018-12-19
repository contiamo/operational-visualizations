import { PieChart } from "../../../";
import { Data, RendererOptions } from "../../../PieChart/typings";
import { MarathonEnvironment } from "../../Marathon";

const DonutRenderer: RendererOptions = {
  type: "donut",
};

const data: Data = {
  data: [
    { key: "Berlin", value: 15 },
    { key: "Dortmund", value: undefined },
    { key: "Bonn", value: 5 },
    { key: "Cologne", value: 17 },
    { key: "Munich", value: undefined },
    { key: "Potsdam", value: 2 },
  ],
  renderAs: [DonutRenderer],
};

export const marathon = ({ test, afterAll, container }: MarathonEnvironment): void => {
  const viz = new PieChart(container);

  test("Renders the chart", () => {
    viz.data(data);
    viz.draw();
  });

  afterAll(() => {
    viz.close();
  });
};

export const title = "Missing data";

// Must match the file name so we can link to the code on GitHub
export const slug = "general-3";
