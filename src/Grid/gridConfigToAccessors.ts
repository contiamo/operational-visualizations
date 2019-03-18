import defaultConfig from "./gridConfig";

import {
  Cell,
  Dimension,
  DimensionWithPrimitiveAndMetadata,
  DimensionWithValueAndMetadata,
  RowOrColumn,
} from "../data_handling/multidimensional_dataset";

import {
  Accessors,
  ConstantOrPredicateArray,
  ConstantOrRecord,
  ConstantOrSliceArray,
  GridConfig,
  RowHeaderOrientation,
} from "./types";

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
};

/**
 * Merges grid config objects
 */
export function mergeConfig(
  config: RecursivePartial<GridConfig>,
  customConfig: RecursivePartial<GridConfig>,
): RecursivePartial<GridConfig> {
  return {
    dimensionTitle: { ...config.dimensionTitle, ...customConfig.dimensionTitle },
    dimensionLabel: { ...config.dimensionLabel, ...customConfig.dimensionLabel },
    rowHeaders: { ...config.rowHeaders, ...customConfig.rowHeaders },
    cells: { ...config.cells, ...customConfig.cells },
    columns: { ...config.columns, ...customConfig.columns },
    rows: { ...config.rows, ...customConfig.rows },
  };
}

const getValue = <T>(config: ConstantOrRecord<T>, key: string) =>
  typeof config === "object" ? (config as Record<string, T>)[key] : config;

/** Returns accessor function for given dimension title property */
const dimensionTitleAccessor = <T>(config: ConstantOrRecord<T>, defaultValue: T) => (
  dim: DimensionWithPrimitiveAndMetadata,
) => getValue<T>(config, dim.key) || defaultValue;

/** Returns accessor function for given dimension label property */
const dimensionLabelAccessor = <T>(config: ConstantOrRecord<T>, defaultValue: T) => (
  dim: DimensionWithValueAndMetadata,
) => getValue<T>(config, dim.value) || defaultValue;

/** Returns accessor function for given row header property */
const rowHeaderAccessor = <T>(config: ConstantOrRecord<T>, defaultValue: T) => (
  dim: DimensionWithPrimitiveAndMetadata,
) => getValue<T>(config, dim.key) || defaultValue;

/** Returns accessor function for given cell property */
const cellAccessor = <T>(config: ConstantOrSliceArray<T>, defaultValue: T) => (cell: Cell) =>
  getCellValue<T>(config, cell) || defaultValue;

const getCellValue = <T>(config: ConstantOrSliceArray<T>, cell: Cell) => {
  if (Array.isArray(config)) {
    const matched = config.find(option => cell.matches(option.sliceOptions));
    return matched && matched.configValue;
  } else {
    return config;
  }
};

/** Returns accessor function for given column or row properties */
const rowOrColumnAccessor = <T>(config: ConstantOrPredicateArray<T>, defaultValue: T) => (rowOrColumn: RowOrColumn) =>
  getRowOrColumnValue(config, rowOrColumn) || defaultValue;

const getRowOrColumnValue = <T>(config: ConstantOrPredicateArray<T>, rowOrColumn: RowOrColumn) => {
  if (Array.isArray(config)) {
    const matched = config.find(option => rowOrColumn.matches(option.predicates));
    return matched && matched.configValue;
  } else {
    return config;
  }
};

/** Returns a full set of grid accessors, based on provided custom config values and the default grid config. */
export default (customConfig: RecursivePartial<GridConfig> = {}): Accessors => {
  const config = mergeConfig(defaultConfig, customConfig);
  return {
    dimensionTitle: ((titleConfig, fallback) => ({
      backgroundColor: dimensionTitleAccessor<string>(titleConfig.backgroundColor, fallback.backgroundColor),
      borderColor: dimensionTitleAccessor<string>(titleConfig.borderColor, fallback.borderColor),
      color: dimensionTitleAccessor<string>(titleConfig.color, fallback.color),
      hide: dimensionTitleAccessor<boolean>(titleConfig.hide, fallback.hide),
      lineHeight: dimensionTitleAccessor<number>(titleConfig.lineHeight, fallback.lineHeight),
      /** The "value" accessor is different because it cannot be a static, constant value */
      value: (dim: DimensionWithPrimitiveAndMetadata) => (titleConfig.value && titleConfig.value[dim.key]) || dim.key,
    }))(config.dimensionTitle, defaultConfig.dimensionTitle),
    dimensionLabel: ((labelConfig, fallback) => ({
      backgroundColor: dimensionLabelAccessor<string>(labelConfig.backgroundColor, fallback.backgroundColor),
      borderColor: dimensionLabelAccessor<string>(labelConfig.borderColor, fallback.borderColor),
      color: dimensionLabelAccessor<string>(labelConfig.color, fallback.color),
      /** The "lineHeight" accessor is different because it can be passed either a dimension OR a dimension value */
      lineHeight: (dim: Dimension) => getValue(labelConfig.lineHeight, dim.key) || fallback.lineHeight,
      /** The "value" accessor is different because it cannot be a static, constant value */
      value: (dim: DimensionWithValueAndMetadata) => (labelConfig.value && labelConfig.value[dim.key]) || dim.value,
    }))(config.dimensionLabel, defaultConfig.dimensionLabel),
    rowHeaders: ((rowHeaderConfig, fallback) => ({
      orientation: rowHeaderAccessor<RowHeaderOrientation>(rowHeaderConfig.orientation, fallback.orientation),
      columnWidths: rowHeaderAccessor<number>(rowHeaderConfig.columnWidths, fallback.columnWidths),
    }))(config.rowHeaders, defaultConfig.rowHeaders),
    cells: ((cellConfig, fallback) => ({
      backgroundColor: cellAccessor<string>(cellConfig.backgroundColor, fallback.backgroundColor),
      borderColor: cellAccessor<string>(cellConfig.borderColor, fallback.borderColor),
      borderWidth: cellAccessor<string>(cellConfig.borderWidth, fallback.borderWidth),
      color: cellAccessor<string>(cellConfig.color, fallback.color),
    }))(config.cells, defaultConfig.cells),
    columns: ((columnConfig, fallback) => ({
      width: rowOrColumnAccessor<number>(columnConfig.width, fallback.width),
    }))(config.columns, defaultConfig.columns),
    rows: ((rowConfig, fallback) => ({
      height: rowOrColumnAccessor<number>(rowConfig.height, fallback.height),
    }))(config.rows, defaultConfig.rows),
  };
};
