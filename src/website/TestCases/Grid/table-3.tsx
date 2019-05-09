import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";
import { PivotGrid } from "../../../NewGrid/PivotGrid";

import AutoSizer from "react-virtualized-auto-sizer";

const rawData = {
  schema: [
    {
      name: "Product.name",
      type: "string",
    },
    {
      name: "Product.brand",
      type: "string",
    },
    {
      name: "unitSales",
      type: "number",
    },
  ],
  data: [
    ["High Top Asparagus", "High Top", 321],
    ["Tri-State Lettuce", "Tri-State", 284],
    ["Plato Grape Jam", "Plato", 325],
    ["Red Wing Soft Napkins", "Red Wing", 361],
    ["Golden Ice Cream Sandwich", "Golden", 304],
    ["Blue Label Beef Soup", "Blue Label", 338],
    ["Red Spade Turkey Hot Dogs", "Red Spade", 306],
    ["Best Choice Low Fat Cookies", "Best Choice", 303],
    ["Gorilla Low Fat Sour Cream", "Gorilla", 315],
    ["Tri-State Garlic", "Tri-State", 297],
  ],
};

const frame = new DataFrame(rawData.schema, rawData.data);

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Product.name"],
      columns: ["Product.brand"],
    });
    ReactDOM.render(
      <AutoSizer style={{ width: "100%", minHeight: "450px", height: "100%", background: "#fff" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["unitSales"]}
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            header={({ value }) => <span title={value}>{value}</span>}
          />
        )}
      </AutoSizer>,
      container,
    );
  });
};

export const title: string = "New Grid with empty cells";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-3";
