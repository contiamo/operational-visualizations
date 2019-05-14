import React from "react";
import ReactDOM from "react-dom";
import { MarathonEnvironment } from "../../Marathon";

import DataFrame from "../../../DataFrame/DataFrame";
import { PivotGrid } from "../../../NewGrid/PivotGrid";

import AutoSizer from "react-virtualized-auto-sizer";

const rawData = {
  columns: [
    {
      name: "A" as "A",
      type: "string",
    },
    {
      name: "B" as "B",
      type: "string",
    },
    {
      name: "C" as "C",
      type: "number",
    },
  ],
  rows: [["a", "c", 1], ["a", "d", 2], ["b", "d", 3]],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

export const marathon = ({ test, container }: MarathonEnvironment) => {
  test("Column measures", () => {
    const pivotedFrame = frame.pivot({
      rows: ["A", "B"],
      columns: [],
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
            measures={["C"]}
            measuresPlacement="row"
            dimensionLabels="top"
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

export const title: string = "Showcase of the bug";

// Must match the file name so we can link to the code on GitHub
export const slug = "table-7";
