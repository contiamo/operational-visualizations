import {
  Cell,
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
  Predicate,
  RowOrColumn,
  SliceOptions,
} from "../data_handling/multidimensional_dataset";

/** Constant value, or record returning values per key */
export type ConstantOrRecord<T> = T | Record<string, T>;

// Config
interface DimensionHeaderConfig {
  /** Text to display by dimension key (titles) or value (value labels) */
  value?: Record<string, string>;
  /** Font color - constant, or color by dimension key (titles) or value (value labels) */
  color: ConstantOrRecord<string>;
  /** Background color - constant, or color by dimension key (titles) or value (value labels) */
  backgroundColor: ConstantOrRecord<string>;
  /** Border color - constant, or color by dimension key (titles) or value (value labels) */
  borderColor: ConstantOrRecord<string>;
  /** Line height - constant, or line height by dimension key */
  lineHeight: ConstantOrRecord<number>;
}

export type DimensionTitleConfig = DimensionHeaderConfig & {
  /** Hide dimension titles - constant, to hide/show all, or per dimension */
  hide: boolean | Record<string, boolean>;
};

export type DimensionLabelConfig = DimensionHeaderConfig;

export type RowHeaderOrientation = "horizontal" | "vertical";

export interface RowHeaderConfig {
  /** Orientation of dimension title and value labels - constant, or by dimension key */
  orientation: ConstantOrRecord<RowHeaderOrientation>;
  /**
   * Widths of row header columns - constant, or by row dimension key.
   * Only applicable to dimensions for which orientation === "horizontal".
   */
  columnWidths: ConstantOrRecord<number>;
}

export type ConstantOrSliceArray<T> = T | Array<{ sliceOptions: SliceOptions; configValue: T }>;

export interface CellConfig {
  /** Background color - constant, or by cells that match slice options */
  backgroundColor: ConstantOrSliceArray<string>;
  /** Border color, if borderWidth > 0 - constant, or by cells that match slice options */
  borderColor: ConstantOrSliceArray<string>;
  /** Border width(s) - constant, or by cells that match slice options */
  borderWidth: ConstantOrSliceArray<string>;
  /** Font color - constant, or by cells that match slice options */
  color: ConstantOrSliceArray<string>;
}

export type ConstantOrPredicateArray<T> = T | Array<{ predicates: Predicate[]; configValue: T }>;

export interface ColumnConfig {
  /**
   * Widths of columns - constant, or by columns that match predicates.
   * If undefined, the grid will expand to fill the available space.
   */
  width: ConstantOrPredicateArray<number>;
}

export interface RowConfig {
  /**
   * Heights of rows - constant, or by rows that match predicates.
   * If undefined, the grid will expand to fill the available space.
   */
  height: ConstantOrPredicateArray<number>;
}

export interface GridConfig {
  /** Config for dimension titles in row and column headers. */
  dimensionTitle: DimensionTitleConfig;
  /** Config for dimension value labels in row and column headers. */
  dimensionLabel: DimensionLabelConfig;
  /** Config specific to row headers. */
  rowHeaders: RowHeaderConfig;
  /** Config for cells. */
  cells: CellConfig;
  /** Config for columns. */
  columns: ColumnConfig;
  /** Config for rows. */
  rows: RowConfig;
}

/**
 * Default grid config must be restricted to constants only,
 * to ensure that all cases are covered.
 */
export interface DefaultGridConfig extends GridConfig {
  dimensionTitle: {
    hide: boolean;
    color: string;
    backgroundColor: string;
    borderColor: string;
    lineHeight: number;
  };
  dimensionLabel: {
    color: string;
    backgroundColor: string;
    borderColor: string;
    lineHeight: number;
  };
  rowHeaders: {
    orientation: RowHeaderOrientation;
    columnWidths: number;
  };
  cells: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: string;
    color: string;
  };
  columns: {
    width: number;
  };
  rows: {
    height: number;
  };
}

// Accessors
// Types and interfaces
export interface DimensionHeaderAccessors<T = any> {
  /** Display name of dimension */
  value: (dim: T) => string;
  /** Font color  */
  color: (dim: T) => string;
  /** Background color */
  backgroundColor: (dim: T) => string;
  /** Border color */
  borderColor: (dim: T) => string;
  /**
   * Corresponds to height of column title, column dimension value label, horizontal row title, or width of vertical row title or dimension value label.
   * Horizontal row dimension value labels use the row height instead.
   * Since the heights must be the same for all dimension values of a given dimension, this value can be accessed
   * via a dimension value or the dimension itself.
   */
  lineHeight: (dim: T | DimensionWithPrimitiveAndMetadata) => number;
}

export type DimensionTitleAccessors = DimensionHeaderAccessors<DimensionWithPrimitiveAndMetadata> & {
  hide: (dim: DimensionWithPrimitiveAndMetadata) => boolean;
};

export type DimensionLabelAccessors = DimensionHeaderAccessors<DimensionWithValueAndMetadata>;

export interface RowHeadersAccessors {
  /** Orientation of title and dimension value labels for a given row dimension */
  orientation: (dim: DimensionWithPrimitiveAndMetadata) => RowHeaderOrientation;
  /**
   * Width of row header column for a given row dimension.
   * Only applicable to dimensions for which orientation === "horizontal".
   */
  columnWidths: (dim: DimensionWithPrimitiveAndMetadata) => number;
}

export interface CellAccessors {
  /** Background color */
  backgroundColor: (cell: Cell) => string;
  /** Border color, if borderWidth > 0 */
  borderColor: (cell: Cell) => string;
  /** Border width(s) */
  borderWidth: (cell: Cell) => string;
  /** Font color */
  color: (cell: Cell) => string;
}

export interface ColumnAccessors {
  /** Width of given column */
  width: (column: RowOrColumn, width?: number) => number;
}

export interface RowAccessors {
  /** Height of given row */
  height: (row: RowOrColumn, height?: number) => number;
}

export interface Accessors {
  /** Accessors for dimension titles in row and column headers */
  dimensionTitle: DimensionTitleAccessors;
  /** Accessors for dimension values in row and column headers */
  dimensionLabel: DimensionLabelAccessors;
  /** Accessors specific to row headers */
  rowHeaders: RowHeadersAccessors;
  /** Cell accessors */
  cells: CellAccessors;
  /** Colum accessors */
  columns: ColumnAccessors;
  /** Row accessors */
  rows: RowAccessors;
}
