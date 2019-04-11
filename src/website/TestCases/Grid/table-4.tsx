import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import MultidimensionalDataset, { Dataset, RawDataset } from "../../../data_handling/multidimensional_dataset";
import Grid from "../../../Grid/Grid";
import defaultGridConfig from "../../../Grid/gridConfig";
import gridConfigToAccessors from "../../../Grid/gridConfigToAccessors";

const rawData: RawDataset<number> = {
  rowDimensions: [
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
  ],
  columnDimensions: [
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
  rows: [
    ["Europe", "Germany", "Berlin"],
    ["Europe", "Germany", "Dresden"],
    ["Europe", "Germany", "Hamburg"],
    ["Europe", "UK", "London"],
    ["Europe", "UK", "Edinburgh"],
    ["Europe", "UK", "Dresden"],
    ["North America", "USA", "New York"],
    ["North America", "Canada", "Toronto"],
  ],
  columns: [
    ["<50", "Female", "sales"],
    ["<50", "Female", "revenue"],
    ["<50", "Male", "sales"],
    ["<50", "Male", "revenue"],
    [">=50", "Female", "sales"],
    [">=50", "Female", "revenue"],
    [">=50", "Male", "sales"],
    [">=50", "Male", "revenue"],
  ],
  data: [
    [101, 10.2, 103, 10.4, 105, 10.6, 107, 10.8],
    [201, 20.2, 203, 20.4, 205, 20.6, 207, 20.8],
    [301, 30.2, 303, 30.4, 305, 30.6, 307, 30.8],
    [401, 40.2, 403, 40.4, 405, 40.6, 407, 40.8],
    [501, 50.2, 503, 50.4, 505, 50.6, 507, 50.8],
    [701, 70.2, 703, 70.4, 705, 70.6, 707, 70.8],
    [801, 80.2, 803, 80.4, 805, 80.6, 807, 80.8],
    [901, 90.2, 903, 90.4, 905, 90.6, 907, 90.8],
  ],
};

/**
 * convert MDD to list of rows, where rows represented as objects
 */
const mddToRows = (m: Dataset<any>) => {
  const serialized = m.serialize();
  const columns = serialized.columns.map(x => x[x.length - 1]);
  const rows = serialized.data;
  return rows.map(row =>
    row.reduce(
      (obj, val, index) => {
        obj[columns[index]] = val;
        return obj;
      },
      {} as any,
    ),
  );
};

const padding = 5;

// @ts-ignore
import OrdinalFrame from "semiotic/lib/OrdinalFrame";

const color = ["#ac58e5", "#9fd0cb", "#E0488B"];

const frameProps = {
  type: "clusterbar",
  // Hardcoded this value for simplicity, but instead it should come from
  // for example MDD.stats({colLumns: measures})
  rExtent: [undefined, 1000],
  // using simplified color assigner function, instead it should be consistent across the graphs
  style: ({ rIndex }: { rIndex: number; rName: string }) => ({ fill: color[rIndex], stroke: "white" }),
  margin: { left: padding, bottom: padding, right: padding, top: padding },
};

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const data = new MultidimensionalDataset(rawData).aggregate({
      x: "Customer.Gender",
      y: "Customer.City",
      merge: mddToRows,
    });

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

export const title: string = "Custom cells";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-4";
