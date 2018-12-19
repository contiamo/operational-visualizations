import { PieChart } from "../../../";
import { Data, RendererOptions } from "../../../PieChart/typings";
import { MarathonEnvironment } from "../../Marathon";

const DonutRenderer: RendererOptions = {
  type: "donut",
};

const data: Data = {
  data: [
    { key: "Berlin", value: 18 },
    { key: "Dortmund", value: 12 },
    { key: "Bonn", value: 4 },
    { key: "Cologne", value: 15 },
    { key: "Munich", value: 3 },
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

  test("Resizes the chart", () => {
    viz.config({ width: 300, height: 400 });
    viz.draw();
  });

  afterAll(() => {
    viz.close();
  });
};

export const title = "Resizing";

// Must match the file name so we can link to the code on GitHub
export const slug = "donut-2";
