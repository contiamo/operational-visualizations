import { DataFrame, uniqueValues, IteratableFrame } from "@operational/frame";
import { PivotGrid } from "@operational/grid";
import { Axis, Bars, useScaleBand, useScaleLinear } from "@operational/visualizations";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";

const rawData = {
  columns: [
    {
      name: "Customer.Continent" as "Customer.Continent",
      type: "string",
    },
    {
      name: "Customer.Country" as "Customer.Country",
      type: "string",
    },
    {
      name: "Customer.City" as "Customer.City",
      type: "string",
    },
    {
      name: "Customer.AgeGroup" as "Customer.AgeGroup",
      type: "string",
    },
    {
      name: "Customer.Gender" as "Customer.Gender",
      type: "string",
    },
    {
      name: "sales" as "sales",
      type: "number",
    },
    {
      name: "revenue" as "revenue",
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
    ["Europe", "Germany", "Berlin", "<50", "Male", 103, 10.4],
    ["Europe", "Germany", "Dresden", "<50", "Male", 203, 20.4],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 303, 30.4],
    ["Europe", "UK", "London", "<50", "Male", 403, 40.4],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 503, 50.4],
    ["Europe", "UK", "Dresden", "<50", "Male", 703, 70.4],
    ["North America", "USA", "New York", "<50", "Male", 803, 80.4],
    ["North America", "Canada", "Toronto", "<50", "Male", 903, 90.4],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 105, 10.6],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 205, 20.6],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 305, 30.6],
    ["Europe", "UK", "London", ">=50", "Female", 405, 40.6],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 505, 50.6],
    ["Europe", "UK", "Dresden", ">=50", "Female", 705, 70.6],
    ["North America", "USA", "New York", ">=50", "Female", 805, 80.6],
    ["North America", "Canada", "Toronto", ">=50", "Female", 905, 90.6],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 107, 10.8],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 207, 20.8],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 307, 30.8],
    ["Europe", "UK", "London", ">=50", "Male", 407, 40.8],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 507, 50.8],
    ["Europe", "UK", "Dresden", ">=50", "Male", 707, 70.8],
    ["North America", "USA", "New York", ">=50", "Male", 807, 80.8],
    ["North America", "Canada", "Toronto", ">=50", "Male", 907, 90.8],
  ],
};

const frame = new DataFrame(rawData.columns, rawData.rows);

const rawDataWithMissingCells = {
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

const frameWithMissingCells = new DataFrame(rawDataWithMissingCells.schema, rawDataWithMissingCells.data);

const rawDataWithBoolean = {
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

const frameWithBoolean = new DataFrame(rawDataWithBoolean.columns, rawDataWithBoolean.rows);

const rawDataForBug = {
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

const frameForBug = new DataFrame(rawDataForBug.columns, rawDataForBug.rows);

storiesOf("@operational/grid/1. Pivot table", module)
  .add("basic", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });
    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["sales", "revenue"]}
            style={{
              cell: { padding: "10px", textAlign: "right", background: "#fff" },
              background: "rgb(246, 246, 246)",
              // background: "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)",
              header: {
                padding: "10px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              },
            }}
            measuresPlacement="column"
            dimensionLabels="top"
          />
        )}
      </AutoSizer>
    );
  })
  .add("frame with missing cells", () => {
    const pivotedFrame = frameWithMissingCells.pivot({
      rows: ["Product.name"],
      columns: ["Product.brand"],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
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
            dimensionLabels={{ column: "top", row: "left" }}
          />
        )}
      </AutoSizer>
    );
  })
  .add("pivoting in one direction, measures in rows", () => {
    const pivotedFrame = frame.pivot({
      rows: [],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["sales", "revenue"]}
            measuresPlacement="row"
            dimensionLabels="top"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ measure }: { measure: string }) => `${measure}`}
          />
        )}
      </AutoSizer>
    );
  })
  .add("pivoting in one direction, measures in columns", () => {
    const pivotedFrame = frame.pivot({
      rows: [],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["sales", "revenue"]}
            measuresPlacement="column"
            dimensionLabels="top"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ measure }: { measure: string }) => `${measure}`}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with boolean columns", () => {
    const pivotedFrame = frameWithBoolean.pivot({
      rows: [],
      columns: ["Product.recyclablePackaging"],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["sales"]}
            dimensionLabels="left"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
          />
        )}
      </AutoSizer>
    );
  })
  .add("demo of the bug", () => {
    const pivotedFrame = frameForBug.pivot({
      rows: ["A", "B"],
      columns: [],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
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
      </AutoSizer>
    );
  })
  .add("allow zero dimensions", () => {
    const pivotedFrame = frameForBug.pivot({
      rows: [],
      columns: [],
    });

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            measures={["A", "B", "C"]}
            measuresPlacement="row"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ measure }: { measure: string }) => `Data for: ${measure}`}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with vizualisation", () => {
    const padding = 5;
    const chartWidth = 100;
    const chartHeight = 100;
    // number of maximal bars in a row (value picked manually)
    const magicMaxNumberOfBars = 3;
    const barWidth = (chartHeight - padding * 2) / magicMaxNumberOfBars;

    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const Row: React.FC<{ row: number; width: number; height: number }> = ({ row, width, height }) => {
      const h = height - 2 * padding;
      const yScale = useScaleBand({
        frame: pivotedFrame.row(row) as IteratableFrame<string>,
        column: "Customer.City",
        range: [0, height],
      });
      return (
        <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ margin: `${padding} 0` }}>
          <Axis scale={yScale} transform={`translate(${width}, -${padding})`} position="left" />
        </svg>
      );
    };
    const axes = { row: Row };

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {size => (
          <PivotGrid
            type="generalWithMeasures"
            measures={["sales", "revenue"]}
            width={size.width}
            height={size.height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                if ("row" in param) {
                  return uniqueValues(pivotedFrame.row(param.row), "Customer.City").length * barWidth + padding * 2;
                }
                return "columnIndex" in param || ("measure" in param && param.measure === true) ? 35 : chartHeight;
              },
              width: param =>
                "rowIndex" in param || ("measure" in param && param.measure === true) ? 120 : chartWidth,
            }}
            cell={({ data, row, width, height, measure }) => {
              const w = width - 2 * padding;
              const h = height - 2 * padding;
              const yScale = useScaleBand({
                frame: pivotedFrame.row(row) as IteratableFrame<string>,
                column: "Customer.City",
                range: [0, h],
              });
              const xScale = useScaleLinear({
                frame: frame as IteratableFrame<string>,
                range: [0, w],
                column: "sales",
              });
              return (
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ margin: padding }}>
                  <Bars
                    data={data as IteratableFrame<string>}
                    metricScale={xScale}
                    categoricalScale={yScale}
                    metric={frame.getCursor(measure)}
                    categorical={frame.getCursor("Customer.City")}
                    style={{ fill: "#1f78b4" }}
                    direction="horizontal"
                  />
                </svg>
              );
            }}
          />
        )}
      </AutoSizer>
    );
  });
