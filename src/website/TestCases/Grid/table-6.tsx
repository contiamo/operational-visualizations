import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";
import { PivotGrid } from "../../../NewGrid/PivotGrid";

import AutoSizer from "react-virtualized-auto-sizer";

const rawData = {
  columns: [
    {
      name: "Product.recyclablePackaging",
      type: "boolean",
    },
    {
      name: "sales",
      type: "number",
    },
  ],
  rows: [[false, 464473.76], [true, 614673.71]],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: [],
      columns: ["Product.recyclablePackaging"],
    });

    ReactDOM.render(
      <AutoSizer
        style={{
          width: "100%",
          minHeight: "450px",
          height: "100%",
          background: "#fff",
        }}
      >
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["sales"]}
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
          />
        )}
      </AutoSizer>,
      container,
    );
  });
};

export const title: string = "Grid with boolean columns";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-6";
