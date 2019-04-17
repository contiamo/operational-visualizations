import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../data_handling/DataFrame";
import MultidimensionalDataset from "../../../data_handling/multidimensional_dataset";
import Grid from "../../../Grid/Grid";
import defaultGridConfig from "../../../Grid/gridConfig";
import gridConfigToAccessors from "../../../Grid/gridConfigToAccessors";

const rawData = {
  columns: [
    {
      name: "Customer.Continent",
      type: "string",
    },
    {
      name: "Customer.Country",
      type: "string",
    },
    {
      name: "Customer.City",
      type: "string",
    },
    {
      name: "Customer.AgeGroup",
      type: "string",
    },
    {
      name: "Customer.Gender",
      type: "string",
    },
    {
      name: "sales",
      type: "number",
    },
    {
      name: "revenue",
      type: "number",
    },
  ],
  rows: [
    ["Europe", "Germany", "Berlin", "<50", "Female", 101, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Female", 201, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 301, 30.2],
    ["Europe", "UK", "London", "<50", "Female", 401, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 501, 50.2],
    ["Europe", "UK", "Dresden", "<50", "Female", 701, 70.2],
    ["North America", "USA", "New York", "<50", "Female", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 901, 90.2],
    ["Europe", "Germany", "Berlin", "<50", "Male", 10.2, 103],
    ["Europe", "Germany", "Dresden", "<50", "Male", 20.2, 203],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 30.2, 303],
    ["Europe", "UK", "London", "<50", "Male", 40.2, 403],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 50.2, 503],
    ["Europe", "UK", "Dresden", "<50", "Male", 70.2, 703],
    ["North America", "USA", "New York", "<50", "Male", 80.2, 803],
    ["North America", "Canada", "Toronto", "<50", "Male", 90.2, 903],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 103, 10.4],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 203, 20.4],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 303, 30.4],
    ["Europe", "UK", "London", ">=50", "Female", 403, 40.4],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 503, 50.4],
    ["Europe", "UK", "Dresden", ">=50", "Female", 703, 70.4],
    ["North America", "USA", "New York", ">=50", "Female", 803, 80.4],
    ["North America", "Canada", "Toronto", ">=50", "Female", 903, 90.4],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 10.4, 105],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 20.4, 205],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 30.4, 305],
    ["Europe", "UK", "London", ">=50", "Male", 40.4, 405],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 50.4, 505],
    ["Europe", "UK", "Dresden", ">=50", "Male", 70.4, 705],
    ["North America", "USA", "New York", ">=50", "Male", 80.4, 805],
    ["North America", "Canada", "Toronto", ">=50", "Male", 90.4, 905],
  ],
};

const padding = 5;

const frame = new DataFrame(rawData.columns, rawData.rows);

// TODO implement this functionality in DataFrameStats
let max: number;

frame.forEach(["sales", "revenue"], (sales, revenue) => {
  if (max === undefined) {
    max = sales;
  }
  max = Math.max(sales, revenue, max);
});

// @ts-ignore
import OrdinalFrame from "semiotic/lib/OrdinalFrame";

const color = ["#ac58e5", "#9fd0cb", "#E0488B"];
const range = [0, max!];

const frameProps = {
  type: "clusterbar",
  rExtent: range,
  // using simplified color assigner function, instead it should be consistent across the graphs
  style: ({ rIndex }: { rIndex: number; rName: string }) => ({ fill: color[rIndex], stroke: "white" }),
  margin: { left: padding, bottom: padding, right: padding, top: padding },
};

// TODO: Grid needs to accept render prop for axes
// import { scaleLinear } from "d3-scale";
// import { Axis } from 'semiotic';
//  <Axis
//    size={[0, 1000]}
//    scale={scaleLinear().domain([ 10, 1000 ]).range([ width, height ])}
//    orient={'left'}
// />

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const data = new MultidimensionalDataset(
      frame
        .groupBy(["Customer.Continent", "Customer.Country", "Customer.City", "Customer.AgeGroup", "Customer.Gender"])
        .transform("aggregate", (x: DataFrame) => x.toRecordList())
        .pivot({
          rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
          columns: ["Customer.AgeGroup", "Customer.Gender"],
          columnsMeasures: ["aggregate"],
        }),
    );

    const accessors = gridConfigToAccessors({
      ...defaultGridConfig,
      ...{
        columns: {
          width: 100 + padding * 2,
        },
        rows: {
          height: 100 + padding * 2,
        },
      },
    });
    ReactDOM.render(
      <div style={{ display: "inline-block" }}>
        <Grid
          data={data}
          axes={{}}
          accessors={accessors}
          cell={({ cell, width, height }) => (
            <OrdinalFrame
              {...frameProps}
              data={cell}
              size={[width, height]}
              rAccessor={Object.keys((cell as any)[0])}
            />
          )}
        />
      </div>,
      container,
    );
  });
};

export const title: string = "Cell render prop with new DataFrame";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-5";
