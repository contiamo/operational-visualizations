import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import MultidimensionalDataset, { RawDataset } from "../../../data_handling/multidimensional_dataset";
import Grid from "../../../Grid/Grid";
import defaultGridConfig from "../../../Grid/gridConfig";
import gridConfigToAccessors from "../../../Grid/gridConfigToAccessors";

const rawData: RawDataset<number> = {
  rowDimensions: [
    {
      key: "Customer.AgeGroup",
      metadata: {},
      primitive: "string",
    },
    {
      key: "Customer.Gender",
      metadata: {},
      primitive: "string",
    },
  ],
  columnDimensions: [
    {
      key: "Customer.Continent",
      metadata: {},
      primitive: "string",
    },
    {
      key: "Customer.Country",
      metadata: {},
      primitive: "string",
    },
    {
      key: "Customer.City",
      metadata: {},
      primitive: "string",
    },
    {
      key: "measures",
      metadata: {
        measures: [
          {
            key: "sales",
            metadata: {},
            primitive: "number",
          },
          {
            key: "revenue",
            metadata: {},
            primitive: "number",
          },
        ],
      },
      primitive: "string",
    },
  ],
  rows: [["<50", "Female"], ["<50", "Male"], [">=50", "Female"], [">=50", "Male"]],
  columns: [
    ["Europe", "Germany", "Berlin", "sales"],
    ["Europe", "Germany", "Berlin", "revenue"],
    ["Europe", "Germany", "Dresden", "sales"],
    ["Europe", "Germany", "Dresden", "revenue"],
    ["Europe", "Germany", "Hamburg", "sales"],
    ["Europe", "Germany", "Hamburg", "revenue"],
    ["Europe", "UK", "London", "sales"],
    ["Europe", "UK", "London", "revenue"],
    ["Europe", "UK", "Edinburgh", "sales"],
    ["Europe", "UK", "Edinburgh", "revenue"],
    ["Europe", "Germany", "Hamburg", "sales"],
    ["Europe", "Germany", "Hamburg", "revenue"],
    ["Europe", "UK", "Dresden", "sales"],
    ["Europe", "UK", "Dresden", "revenue"],
    ["North America", "USA", "New York", "sales"],
    ["North America", "USA", "New York", "revenue"],
    ["North America", "Canada", "Toronto", "sales"],
    ["North America", "Canada", "Toronto", "revenue"],
  ],
  data: [
    [101, 20.2, 103, 20.4, 105, 20.6, 107, 20.8, 109, 21, 111, 21.2, 113, 21.4, 115, 21.6, 117, 21.8],
    [201, 10.2, 203, 10.4, 205, 10.6, 207, 10.8, 209, 11, 211, 11.2, 213, 11.4, 215, 11.6, 217, 11.8],
    [301, 40.2, 303, 40.4, 305, 40.6, 307, 40.8, 309, 41, 311, 41.2, 313, 41.4, 315, 41.6, 317, 41.8],
    [401, 30.2, 403, 30.4, 405, 30.6, 407, 30.8, 409, 31, 411, 31.2, 413, 31.4, 415, 31.6, 417, 31.8],
  ],
};

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Row measures", () => {
    const data = new MultidimensionalDataset(rawData).transform(cell => () => cell.value().toString());
    const accessors = gridConfigToAccessors(defaultGridConfig);
    ReactDOM.render(
      <div style={{ display: "inline-block" }}>
        <Grid data={data} axes={{}} accessors={accessors} />
      </div>,
      container,
    );
  });
};

export const title: string = "Row measures";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-1";
