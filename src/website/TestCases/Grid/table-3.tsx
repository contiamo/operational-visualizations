import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import MultidimensionalDataset, { Predicate, RawDataset } from "../../../data_handling/multidimensional_dataset";
import Grid from "../../../Grid/Grid";
import gridConfigToAccessors, { RecursivePartial } from "../../../Grid/gridConfigToAccessors";
import { GridConfig } from "../../../Grid/types";

const axisColors = {
  border: "#adadad",
  rules: "#e8e8e8",
  label: "#999999",
};

const focusColors = {
  label: "#2f3435",
  stroke: "#999999",
};

const backgroundColors = {
  dark: "#c6c6c6",
  light: "#ececec",
  lighter: "#f6f6f6",
};

const theme = {
  colors: {
    axis: axisColors,
    focus: focusColors,
    background: backgroundColors,
    white: "#ffffff",
    primary: "#1499ce",
    lightGrey: "#e8e8e8",
  },
};

const rowPredicates: Predicate[] = [{ key: "Customer.City", type: "include", values: ["New York"] }];

const columnPredicates: Predicate[] = [
  { key: "Customer.AgeGroup", type: "include", values: [">=50"] },
  { key: "Customer.Gender", type: "include", values: ["Female"] },
  { key: "measures", type: "include", values: ["sales"] },
];

const gridConfig: RecursivePartial<GridConfig> = {
  dimensionTitle: {
    hide: {
      measures: true,
      "Customer.Gender": true,
    },
    value: {
      "Customer.Continent": "CONTINENT",
      "Customer.Country": "Country",
      measures: "MEASURES",
    },
    color: "#545454",
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.white,
    lineHeight: {
      "Customer.AgeGroup": 50,
      "Customer.Gender": 40,
    },
  },
  dimensionLabel: {
    value: {
      Berlin: "BERLIN",
    },
    color: {
      "North America": theme.colors.primary,
      USA: theme.colors.primary,
      "New York": theme.colors.primary,
    },
    backgroundColor: theme.colors.background.light,
    borderColor: theme.colors.white,
    lineHeight: {
      "Customer.AgeGroup": 50,
      "Customer.Gender": 40,
    },
  },
  rowHeaders: {
    orientation: {
      "Customer.Continent": "vertical",
    },
    columnWidths: {
      "Customer.Country": 200,
      "Customer.City": 150,
    },
  },
  cells: {
    backgroundColor: [{ sliceOptions: { x: columnPredicates, y: rowPredicates }, configValue: theme.colors.primary }],
    borderColor: [
      { sliceOptions: { x: columnPredicates, y: rowPredicates }, configValue: theme.colors.primary },
      { sliceOptions: { x: columnPredicates }, configValue: `${theme.colors.axis.rules} ${theme.colors.primary}` },
      { sliceOptions: { y: rowPredicates }, configValue: `${theme.colors.primary} ${theme.colors.axis.rules}` },
    ],
    borderWidth: [
      { sliceOptions: { x: columnPredicates, y: rowPredicates }, configValue: "2" },
      { sliceOptions: { y: rowPredicates }, configValue: "2 1" },
      { sliceOptions: { x: columnPredicates }, configValue: "1 2" },
    ],
    color: [{ sliceOptions: { x: columnPredicates, y: rowPredicates }, configValue: theme.colors.white }],
  },
  columns: {
    width: [{ predicates: columnPredicates, configValue: 200 }, { predicates: [], configValue: 100 }],
  },
  rows: {
    height: [{ predicates: rowPredicates, configValue: 50 }, { predicates: [], configValue: 30 }],
  },
};

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
    ["Europe", "Germany", "Hamburg"],
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
    [601, 60.2, 603, 60.4, 605, 60.6, 607, 60.8],
    [701, 70.2, 703, 70.4, 705, 70.6, 707, 70.8],
    [801, 80.2, 803, 80.4, 805, 80.6, 807, 80.8],
    [901, 90.2, 903, 90.4, 905, 90.6, 907, 90.8],
  ],
};

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Grid config", () => {
    const data = new MultidimensionalDataset(rawData);
    const accessors = gridConfigToAccessors(gridConfig);
    ReactDOM.render(
      <div style={{ display: "inline-block" }}>
        <Grid data={data} axes={{}} accessors={accessors} cell={({ cell }) => `${cell}`} />
      </div>,
      container,
    );
  });
};

export const title: string = "Grid config";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-3";
