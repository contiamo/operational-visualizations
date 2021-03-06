import { DataFrame, uniqueValues, total } from "@operational/frame";
import { PivotGrid, RowProps, CellPropsWithMeasure, ColumnProps } from "@operational/grid";
import { Axis, Bars, useScaleBand, useScaleLinear, useScale, Dots } from "@operational/visualizations";
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
            rowMeasures={["sales", "revenue"]}
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
            rowMeasures={["unitSales"]}
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
            rowMeasures={["sales", "revenue"]}
            dimensionLabels="top"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ rowMeasure, columnMeasure, data, row, column }: CellPropsWithMeasure) => (
              <>${total(data.cell(row, column), data.getCursor(rowMeasure || columnMeasure)).toFixed(2)}</>
            )}
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
            columnMeasures={["sales", "revenue"]}
            dimensionLabels="top"
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ rowMeasure, columnMeasure, data, row, column }: CellPropsWithMeasure) => (
              <>${total(data.cell(row, column), data.getCursor(rowMeasure || columnMeasure)).toFixed(2)}</>
            )}
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
            rowMeasures={["sales"]}
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
            columnMeasures={["C"]}
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
            columnMeasures={["A", "B", "C"]}
            style={{
              cell: { padding: "10px", textAlign: "right" },
            }}
            cell={({ rowMeasure, columnMeasure }: CellPropsWithMeasure) => <>Data for: {rowMeasure || columnMeasure}</>}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with bars", () => {
    const padding = 5;
    const chartWidth = 100;
    const chartHeight = 100;
    // number of maximal bars in a row (value picked manually)
    const magicMaxNumberOfBars = 3;
    const barWidth = (chartHeight - padding * 2) / magicMaxNumberOfBars;

    const cityCursor = frame.getCursor("Customer.City");
    const salesCursor = frame.getCursor("sales");
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const Row: React.FC<RowProps> = ({ row, width, height, data }) => {
      const heightWithoutPadding = height - 2 * padding;
      const yScale = useScaleBand({
        frame: data.row(row),
        column: cityCursor,
        range: [0, height],
      });
      return (
        <svg
          width={width}
          height={heightWithoutPadding}
          viewBox={`0 0 ${width} ${heightWithoutPadding}`}
          style={{ margin: `${padding} 0` }}
        >
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
            rowMeasures={["sales", "revenue"]}
            columnMeasures={[]}
            width={size.width}
            height={size.height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                if (param.type === "Cell") {
                  // number of bars in bar chart - one bar per unique city
                  const numberOfBars = uniqueValues(param.data.row(param.row), cityCursor).length;
                  // height of the cell is numberOfBars times barWidth plus padding
                  return numberOfBars * barWidth + padding * 2;
                } else {
                  return 35;
                }
              },
              width: param => (param.type === "Cell" ? chartWidth : 120),
            }}
            cell={({ data, row, column, width, height, rowMeasure, columnMeasure }) => {
              const widthWithoutPadding = width - 2 * padding;
              const heightWithoutPadding = height - 2 * padding;
              const yScale = useScaleBand({
                frame: data.row(row),
                column: cityCursor,
                range: [0, heightWithoutPadding],
              });
              const xScale = useScaleLinear({
                frame: data.unpivot(),
                range: [0, widthWithoutPadding],
                column: salesCursor,
              });
              return (
                <svg
                  width={widthWithoutPadding}
                  height={heightWithoutPadding}
                  viewBox={`0 0 ${widthWithoutPadding} ${heightWithoutPadding}`}
                  style={{ margin: padding }}
                >
                  <Bars
                    data={data.cell(row, column)}
                    xScale={xScale}
                    yScale={yScale}
                    x={frame.getCursor(rowMeasure || columnMeasure)}
                    y={frame.getCursor("Customer.City")}
                    style={{ fill: "#1f78b4" }}
                  />
                </svg>
              );
            }}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with scatter plot (measures)", () => {
    const padding = 5;
    const chartWidth = 100;
    const chartHeight = 100;
    const width = chartWidth;
    const height = chartHeight;

    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const Row: React.FC<RowProps> = ({ data, measure }) => {
      const heightWithoutPadding = height - 2 * padding;
      const yScale = useScale({
        type: "linear",
        frame: data.unpivot(),
        column: data.getCursor(measure!),
        range: [0, heightWithoutPadding],
      });
      return (
        <svg
          width={120}
          height={heightWithoutPadding}
          viewBox={`0 0 ${width} ${heightWithoutPadding}`}
          style={{ margin: `${padding} 0` }}
        >
          <Axis scale={yScale} transform={`translate(${120 - padding * 2}, -${padding})`} position="left" />
        </svg>
      );
    };

    const Column: React.FC<ColumnProps> = ({ data, measure }) => {
      const widthWithoutPadding = width - 2 * padding;
      const xScale = useScale({
        type: "linear",
        frame: data.unpivot(),
        column: data.getCursor(measure!),
        range: [0, widthWithoutPadding],
      });
      return (
        <svg
          width={widthWithoutPadding}
          height={height}
          viewBox={`0 0 ${widthWithoutPadding} ${height}`}
          style={{ margin: `${padding} 0` }}
        >
          <Axis scale={xScale} transform={`translate(${padding}, ${35 - padding - 1})`} position="top" />
        </svg>
      );
    };

    const axes = { row: Row, column: Column };

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {size => (
          <PivotGrid
            type="generalWithMeasures"
            rowMeasures={["sales"]}
            columnMeasures={["revenue"]}
            width={size.width}
            height={size.height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                if (param.type === "Cell") {
                  return chartHeight;
                } else {
                  return 35;
                }
              },
              width: param => (param.type === "Cell" ? chartWidth : 120),
            }}
            cell={({ data, row, column, rowMeasure, columnMeasure }) => {
              const widthWithoutPadding = width - 2 * padding;
              const heightWithoutPadding = height - 2 * padding;
              const yScale = useScale({
                type: "linear",
                frame: data.unpivot(),
                column: data.getCursor(rowMeasure),
                range: [0, heightWithoutPadding],
              });
              const xScale = useScale({
                type: "linear",
                frame: data.unpivot(),
                column: data.getCursor(columnMeasure),
                range: [0, widthWithoutPadding],
              });
              return (
                <svg
                  width={widthWithoutPadding}
                  height={heightWithoutPadding}
                  viewBox={`0 0 ${widthWithoutPadding} ${heightWithoutPadding}`}
                  style={{ margin: padding }}
                >
                  <Dots
                    data={data.cell(row, column)}
                    xScale={xScale}
                    yScale={yScale}
                    y={data.getCursor(rowMeasure)}
                    x={data.getCursor(columnMeasure)}
                    style={{ fill: "#1f78b4" }}
                  />
                </svg>
              );
            }}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with scatter plot (dimensions)", () => {
    const padding = 5;
    const chartWidth = 100;
    const chartHeight = 100;
    const width = chartWidth;
    const height = chartHeight;

    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent"],
      columns: ["Customer.AgeGroup"],
    });

    const Row: React.FC<RowProps> = ({ data, row }) => {
      const heightWithoutPadding = height - 2 * padding;
      const yScale = useScale({
        type: "band",
        frame: data.row(row),
        column: data.getCursor("Customer.Country"),
        range: [0, heightWithoutPadding],
      });
      return (
        <svg
          width={120}
          height={heightWithoutPadding}
          viewBox={`0 0 ${width} ${heightWithoutPadding}`}
          style={{ margin: `${padding} 0` }}
        >
          <Axis scale={yScale} transform={`translate(${120 - padding * 2}, -${padding})`} position="left" />
        </svg>
      );
    };

    const Column: React.FC<ColumnProps> = ({ data, column }) => {
      const widthWithoutPadding = width - 2 * padding;
      const xScale = useScale({
        type: "band",
        frame: data.column(column),
        column: data.getCursor("Customer.Gender"),
        range: [0, widthWithoutPadding],
      });
      return (
        <svg
          width={widthWithoutPadding}
          height={height}
          viewBox={`0 0 ${widthWithoutPadding} ${height}`}
          style={{ margin: `${padding} 0` }}
        >
          <Axis scale={xScale} transform={`translate(${padding}, ${35 - padding - 1})`} position="top" />
        </svg>
      );
    };

    const axes = { row: Row, column: Column };

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {size => (
          <PivotGrid
            type="generalWithMeasures"
            width={size.width}
            height={size.height}
            axes={axes}
            data={pivotedFrame}
            accessors={{
              height: param => {
                if (param.type === "Cell") {
                  return chartHeight;
                } else {
                  return 35;
                }
              },
              width: param => (param.type === "Cell" ? chartWidth : 120),
            }}
            cell={({ data, row, column }) => {
              const widthWithoutPadding = width - 2 * padding;
              const heightWithoutPadding = height - 2 * padding;
              const yScale = useScale({
                type: "band",
                frame: data.cell(row, column),
                column: data.getCursor("Customer.Country"),
                range: [0, heightWithoutPadding],
              });
              const xScale = useScale({
                type: "band",
                frame: data.cell(row, column),
                column: data.getCursor("Customer.Gender"),
                range: [0, widthWithoutPadding],
              });
              return (
                <svg
                  width={widthWithoutPadding}
                  height={heightWithoutPadding}
                  viewBox={`0 0 ${widthWithoutPadding} ${heightWithoutPadding}`}
                  style={{ margin: padding }}
                >
                  <Dots
                    data={data.cell(row, column)}
                    xScale={xScale}
                    yScale={yScale}
                    y={data.getCursor("Customer.Country")}
                    x={data.getCursor("Customer.Gender")}
                    style={{ fill: "#1f78b4" }}
                  />
                </svg>
              );
            }}
          />
        )}
      </AutoSizer>
    );
  })
  .add("with cell colors", () => {
    const pivotedFrame = frame.pivot({
      rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
      columns: ["Customer.AgeGroup", "Customer.Gender"],
    });

    const colorCell = ({ column, row, data, rowMeasure, columnMeasure }: CellPropsWithMeasure<string>) => {
      const value = data.cell(row, column).peak(rowMeasure || columnMeasure);

      const countryCursor = pivotedFrame.getCursor("Customer.Country");
      const genderCursor = pivotedFrame.getCursor("Customer.Gender");

      const rowCursor = data.cell(row, column).row(0);
      const country = countryCursor(rowCursor);
      const gender = genderCursor(rowCursor);

      return (
        <div
          style={{
            padding: "10px",
            textAlign: "right",
            background: country === "UK" ? "#f5b2b2" : gender === "Male" ? "#eee" : "#fff",
          }}
        >
          {value === null ? null : <>{value}</>}
        </div>
      );
    };

    return (
      <AutoSizer style={{ minHeight: "500px", height: "100%" }}>
        {({ width, height }) => (
          <PivotGrid
            width={width}
            height={height}
            data={pivotedFrame}
            rowMeasures={["sales", "revenue"]}
            cell={colorCell}
            style={{
              background: "rgb(246, 246, 246)",
              // background: "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)",
              header: {
                padding: "10px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              },
            }}
            dimensionLabels="top"
          />
        )}
      </AutoSizer>
    );
  });
