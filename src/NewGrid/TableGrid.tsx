import React, { useMemo } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import DataFrame from "../DataFrame/DataFrame";

type Diff<T, U> = T extends U ? never : T;
type Defined<T> = Diff<T, undefined>;

// Optimisation for hooks, because {} !== {}
const emptyObject = Object.freeze({});

const defaultBorderStyle = "1px solid #e8e8e8";
const defaultBackground = "#fff";

const defaultWidth = () => 120;
const defaultHeight = () => 35;

const defaultHeaderStyle: React.CSSProperties = {
  padding: "10px",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

interface Props<Name extends string = string> {
  width: number;
  height: number;
  data: DataFrame<Name>;
  style?: {
    cell?: React.CSSProperties;
    header?: React.CSSProperties;
    border?: string;
    background?: string;
  };
  accessors?: {
    width?: () => number;
    height?: () => number;
  };
}

export function TableGrid<Name extends string = string>(props: Props<Name>) {
  const { data } = props;

  const columnCount = data.stats().columns;
  const rowCount = data.stats().rows + 1;

  const accessors = props.accessors || (emptyObject as Defined<Props<Name>["accessors"]>);
  const heightAccessors = accessors.height || (defaultHeight as Defined<Defined<Props<Name>["accessors"]>["height"]>);
  const widthAccessors = accessors.width || (defaultWidth as Defined<Defined<Props<Name>["accessors"]>["width"]>);

  const styleProp = props.style || (emptyObject as Defined<Props<Name>["style"]>);
  const borderStyle = styleProp.border || defaultBorderStyle;
  const cellStyle = styleProp.cell || emptyObject;
  const backgroundStyle = styleProp.background || defaultBackground;
  const headerStyle = styleProp.header || defaultHeaderStyle;

  const Cell = useMemo(
    () => ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      let border: React.CSSProperties = {
        borderTop: borderStyle,
        borderLeft: borderStyle,
        background: backgroundStyle,
      };

      let item: React.ReactNode = null;
      if (rowIndex === 0) {
        border = { ...headerStyle, ...border };
        item = data.schema[columnIndex].name;
      } else {
        border = { ...cellStyle, ...border };
        item = `${data.get(rowIndex - 1, columnIndex)}`;
      }

      return <div style={{ ...border, ...style }}>{item}</div>;
    },
    [data, cellStyle, borderStyle, backgroundStyle],
  );

  return (
    <VariableSizeGrid
      height={props.height}
      width={props.width}
      columnCount={columnCount}
      rowCount={rowCount}
      rowHeight={heightAccessors}
      columnWidth={widthAccessors}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
