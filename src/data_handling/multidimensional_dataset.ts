// Types and interfaces
type DimensionKey = string;
type DimensionValue = string;

export interface Dimension {
  key: DimensionKey;
}

type DimensionWithMetadata = Dimension & {
  metadata?: Record<string, any>;
};

export type DimensionWithPrimitiveAndMetadata = DimensionWithMetadata & {
  primitive?: "string" | "number";
};

export type DimensionWithValueAndMetadata = DimensionWithMetadata & {
  value: DimensionValue;
};

export interface RowOrColumn<T = any> {
  /**
   * Returns the row or column dimensions and their values which define this row/column
   */
  dimensionValues(): DimensionWithValueAndMetadata[];
  /**
   * Returns an array of all cells in the row/column
   */
  cells(): Array<Cell<T>>;
  /**
   * Checks if row/column matches the provided predicate
   * @param predicate Predicate for row/column
   */
  matches(predicates: Predicate[]): boolean;
}

export interface Cell<T = any> {
  /**
   * Returns the column dimensions and their values which define this cell
   */
  x(): DimensionWithValueAndMetadata[];
  /**
   * Returns the row dimensions and their values which define this cell
   */
  y(): DimensionWithValueAndMetadata[];
  /**
   * Checks if rows/columns match the provided predicates
   * @param options Predicates for columns (x) and rows (y)
   */
  matches(options: SliceOptions): boolean;
  /**
   * Returns the data this cell contains
   */
  value(): T;
}

export type Predicate = Dimension & {
  type: "include" | "exclude";
  values: DimensionValue[];
};

export interface SliceOptions {
  x?: Predicate[];
  y?: Predicate[];
}

export interface AggregateOptions<T, U = any> {
  /**
   * Column dimension to aggregate by.
   * All dimensions nested within the specified dimension will be aggregated
   */
  x?: DimensionKey;
  /**
   * Row dimension to aggregate by.
   * All dimensions nested within the specified dimension will be aggregated
   */
  y?: DimensionKey;
  /**
   * Is invoked for each slice that is created based on the x and y dimensions provided
   * @returns the new (merged) cell value
   */
  merge: (data: MultidimensionalDataset<T>) => U;
}

type TransformFunction<T, U> = (cell: Cell<T>) => U;

export interface RawDataset<T = any> {
  rowDimensions: DimensionWithPrimitiveAndMetadata[];
  columnDimensions: DimensionWithPrimitiveAndMetadata[];
  columns: DimensionValue[][];
  rows: DimensionValue[][];
  data: T[][];
}

export interface ReadonlyDataset<T = any> {
  /**
   * Returns true if the dataset contains no data
   */
  isEmpty: () => boolean;
  /**
   * Returns all row dimensions.
   */
  rowDimensions: () => DimensionWithPrimitiveAndMetadata[];
  /**
   * Returns all column dimensions.
   */
  columnDimensions: () => DimensionWithPrimitiveAndMetadata[];
  /**
   * Returns the complete dataset as **rows** of cells.
   */
  rows: () => Array<RowOrColumn<T>>;
  /**
   * Returns the complete dataset as **columns** of cells.
   */
  columns: () => Array<RowOrColumn<T>>;
  /**
   * Returns the underlying raw dataset.
   * The returned raw dataset should not be modified in place.
   */
  serialize: () => RawDataset<T>;
}

export interface Dataset<T = any> extends ReadonlyDataset<T> {
  /**
   * Returns a new dataset which is a subset matching the provided predicates.
   * @param options Predicates for columns (x) and rows (y)
   */
  slice: (options: SliceOptions) => Dataset<T>;
  /**
   * Returns a new dataset which contains groups of cells aggregated / merged into one
   * Attention: This might change sorting if data is not currently sorted top-to-bottom (rows) and left-to-right (columns) according to the order of the dimensions
   * @param options Column (x) and row (y) dimensions to merge by as well as a merge function to perform the cell merge
   */
  aggregate: <U = any>(options: AggregateOptions<T, U>) => Dataset<U>;
  /**
   * Flips the dataset over its diagonal, switches the row and column indices
   */
  transpose: () => Dataset<T>;
  /**
   * Returns a new dataset in which the value of each cell has been transformed according to the provided transform function.
   * @param transform Function that takes the current cell value as input and returns the desired cell value
   */
  transform: <U = any>(transform: TransformFunction<T, U>) => Dataset<U>;
  /**
   * Returns the dataset without slice or aggregate methods.
   */
  readonly: () => ReadonlyDataset<T>;
}

/*
 * Helpers
 */

// Helper to get the unique combinations of row / column dimension values up to a certain dimension
const uniqueDimensionValues = (items: string[][], toIndex: number) =>
  // First, slice off stuff we're not interested in
  // +1 since `slice` extracts up to but not including end
  items
    .map(item => item.slice(0, toIndex + 1))
    // Reduce to find unique combinations. Use an array to reduce so we preserve order
    .reduce<Array<{ compare: string; item: string[] }>>((memo, item) => {
      const compare = item.join("-");
      // Add if this combination does not exist already
      if (!memo.some(i => i.compare === compare)) {
        memo.push({ compare, item });
      }
      return memo;
    }, [])
    // Unwrap
    .map(item => item.item.map(value => value));

// Helper to create a slice option from a list of dimension values and dimensions
const sliceOption = (value: DimensionValue[], dimensions: DimensionWithPrimitiveAndMetadata[]) => {
  return value.map(
    (val, i): Predicate => ({
      key: dimensions[i].key,
      type: "include",
      values: [val],
    }),
  );
};

/**
 * MultidimensionalDataset
 */
class MultidimensionalDataset<T> implements Dataset<T> {
  private readonly data: Readonly<RawDataset<T>>;

  constructor(data: RawDataset<T>) {
    this.validateShape(data);
    this.data = data;
  }

  /**
   * Validates the shape of a raw dataset
   */
  private validateShape(data: RawDataset<T>) {
    const isEmpty = data.data.length === 0;
    const columnDimensions = data.columnDimensions.length;
    const rowDimensions = data.rowDimensions.length;
    const rows = data.rows.length;
    const columns = data.columns.length;

    // Columns and rows need to be compatible with dimensions
    if (data.columns.some(column => column.length !== columnDimensions)) {
      throw new Error(
        "Invalid raw dataset: number of values in any column of `columns` may not be different from number of `columnDimensions`",
      );
    }
    if (data.rows.some(row => row.length !== rowDimensions)) {
      throw new Error(
        "Invalid raw dataset: number of values in any row of `rows` may not be different from number of `rowDimensions`",
      );
    }

    // Data may only be empty if either rows or columns is empty
    if (isEmpty) {
      if (rows > 0 && columns > 0) {
        throw new Error("Invalid raw dataset: `data` may not be empty if both `rows` and `columns` are not empty");
      }
      return true;
    }

    // Data needs to be compatible with columns and rows
    if (data.data.length !== rows) {
      throw new Error("Invalid raw dataset: number of rows in `data` may not be different from number of `rows`");
    }
    if (data.data.some(row => row.length !== columns)) {
      throw new Error("Invalid raw dataset: number of columns in `data` may not be different from number of `columns`");
    }

    return true;
  }

  /**
   * Look up the row index of a dimension
   * @returns Row index
   */
  private rowIndex(key: DimensionKey) {
    return this.data.rowDimensions.findIndex(rowDimension => rowDimension.key === key);
  }

  /**
   * Look up the column index of a dimension
   * @returns Column index
   */
  private columnIndex(key: DimensionKey) {
    return this.data.columnDimensions.findIndex(columnDimension => columnDimension.key === key);
  }

  private validateYDimension(dimension: DimensionKey) {
    if (this.rowIndex(dimension) === -1) {
      throw new Error(`Y dimension '${dimension}' does not exist in the rowDimensions.`);
    }
    return true;
  }

  private validateXDimension(dimension: DimensionKey) {
    if (this.columnIndex(dimension) === -1) {
      throw new Error(`X dimension '${dimension}' does not exist in the columnDimensions.`);
    }
    return true;
  }

  private validateYPredicate(predicates?: Predicate[]) {
    return !predicates || predicates.every(predicate => this.validateYDimension(predicate.key));
  }

  private validateXPredicate(predicates?: Predicate[]) {
    return !predicates || predicates.every(predicate => this.validateXDimension(predicate.key));
  }

  /**
   * Builds a filter for rows / columns based on values to include or exclude
   * @returns Filter function
   */
  private sliceFilter(index: number, predicate: Predicate) {
    return predicate.type === "include"
      ? (items: string[]) => predicate.values.includes(items[index])
      : (items: string[]) => !predicate.values.includes(items[index]);
  }

  /**
   * Slices rows by a predicate
   * @returns Sliced dataset
   */
  private sliceRows(y: Predicate[]) {
    // To avoid things breaking unpredictably, we make sure all predicates are valid
    this.validateYPredicate(y);

    return new MultidimensionalDataset(
      y.reduce((memo, predicate) => {
        // We only need to update "rows" and "data"
        const result: RawDataset<T> = {
          ...memo,
          rows: [],
          data: [],
        };

        // Filter rows
        const filter = this.sliceFilter(this.rowIndex(predicate.key), predicate);
        memo.rows.forEach((row, i) => {
          if (filter(row)) {
            result.rows.push(row);
            // Row-based data: simply keep the row
            if (!this.isEmpty()) {
              result.data.push(memo.data[i]);
            }
          }
        });

        return result;
      }, this.data),
    );
  }

  /**
   * Slices columns by a predicate
   * @returns Sliced dataset
   */
  private sliceColumns(x: Predicate[]) {
    // To avoid things breaking unpredictably, we make sure all predicates are valid
    this.validateXPredicate(x);

    return new MultidimensionalDataset(
      x.reduce((memo, predicate) => {
        // We only need to update "columns" and "data"
        const result: RawDataset<T> = {
          ...memo,
          columns: [],
          data: [],
        };

        // We initialize the initial `data` outside of the result structure as we might end up with empty rows
        // in which case we will not want to include them in our result
        const data: T[][] = Array.from(Array(memo.rows.length)).map(() => []);

        // Build filter function for columns
        const filter = this.sliceFilter(this.columnIndex(predicate.key), predicate);

        // Filter columns
        memo.columns.forEach((column, i) => {
          if (filter(column)) {
            result.columns.push(column);
            // Row-based data: we need to push the column's cell value into each row
            if (!this.isEmpty()) {
              data.forEach((row, j) => row.push(memo.data[j][i]));
            }
          }
        });

        // Add data to result unless we have empty rows
        if (data.some(row => row.length > 0)) {
          result.data = data;
        }

        return result;
      }, this.data),
    );
  }

  /*
   * Public methods implementing the Dataset interface
   */
  public columnDimensions(): DimensionWithMetadata[] {
    return this.data.columnDimensions;
  }

  public columns(): Array<RowOrColumn<T>> {
    return this.data.columns.map((column, i) => {
      const dimensionValues = (): DimensionWithValueAndMetadata[] =>
        column.map((value, j) => ({
          ...this.data.columnDimensions[j],
          value,
        }));

      return {
        dimensionValues,
        cells: () =>
          // Raw data is row-based, thus we need to map over the data
          // to return the right cell from each row
          this.isEmpty()
            ? []
            : this.data.data.map(
                (row, j): Cell<T> => ({
                  x: dimensionValues,
                  y: (): DimensionWithValueAndMetadata[] =>
                    this.data.rows[j].map((value, k) => ({
                      ...this.data.rowDimensions[k],
                      value,
                    })),
                  matches: this.cellMatcher(this.data.rows[j], column),
                  value: (): T => row[i],
                }),
              ),
        matches: (predicates: Predicate[]) => {
          this.validateXPredicate(predicates);
          return (
            !!predicates &&
            predicates.every(predicate => this.sliceFilter(this.columnIndex(predicate.key), predicate)(column))
          );
        },
      };
    });
  }

  public rowDimensions(): DimensionWithMetadata[] {
    return this.data.rowDimensions;
  }

  public rows(): Array<RowOrColumn<T>> {
    return this.data.rows.map((row, j) => {
      const dimensionValues = (): DimensionWithValueAndMetadata[] =>
        row.map((value, i) => ({
          ...this.data.rowDimensions[i],
          value,
        }));

      return {
        dimensionValues,
        // Raw data is row-based, thus we can simply access the
        // right row and return its cells
        cells: () =>
          this.isEmpty()
            ? []
            : this.data.data[j].map(
                (cellValue: T, i): Cell<T> => ({
                  y: dimensionValues,
                  x: (): DimensionWithValueAndMetadata[] =>
                    this.data.columns[i].map((value, k) => ({
                      ...this.data.columnDimensions[k],
                      value,
                    })),
                  matches: this.cellMatcher(row, this.data.columns[i]),
                  value: (): T => cellValue,
                }),
              ),
        matches: (predicates: Predicate[]) => {
          this.validateYPredicate(predicates);
          return (
            !!predicates &&
            predicates.every(predicate => this.sliceFilter(this.rowIndex(predicate.key), predicate)(row))
          );
        },
      };
    });
  }

  private cellMatcher = (rowValues: string[], columnValues: string[]) => (options: SliceOptions) => {
    const matchesX =
      !options.x ||
      (this.validateXPredicate(options.x) &&
        options.x.every(option => this.sliceFilter(this.columnIndex(option.key), option)(columnValues)));
    const matchesY =
      !options.y ||
      (this.validateYPredicate(options.y) &&
        options.y.every(option => this.sliceFilter(this.rowIndex(option.key), option)(rowValues)));
    return matchesX && matchesY;
  };

  public slice(options: SliceOptions) {
    let dataset: MultidimensionalDataset<T> = this;
    if (options.y && options.y.length) {
      dataset = dataset.sliceRows(options.y);
    }
    if (options.x && options.x.length) {
      dataset = dataset.sliceColumns(options.x);
    }
    return dataset;
  }

  public isEmpty() {
    return this.data.data.length === 0;
  }

  public aggregate<U = any>(options: AggregateOptions<T, U>) {
    // Indeces + validate dimensions
    const xIndex = options.x && this.validateXDimension(options.x) ? this.columnIndex(options.x) : -1;
    const yIndex = options.y && this.validateYDimension(options.y) ? this.rowIndex(options.y) : -1;

    // There is no need for further work in the case of an empty datset
    if (this.isEmpty()) {
      return new MultidimensionalDataset(this.serialize() as RawDataset);
    }

    // Unique dimension values
    const xValues = options.x ? uniqueDimensionValues(this.data.columns, xIndex) : [[]];
    const yValues = options.y ? uniqueDimensionValues(this.data.rows, yIndex) : [[]];

    // Prepare the result structure
    const result: RawDataset<U> = {
      columnDimensions: this.data.columnDimensions.slice(0, xIndex + 1),
      rowDimensions: this.data.rowDimensions.slice(0, yIndex + 1),
      columns: xValues,
      rows: yValues,
      data: [],
    };

    // As we have row-based data, we create and iterate through rows of slices
    result.data = yValues.map(yValue =>
      xValues.map(xValue => {
        const sliceOptions: SliceOptions = {};
        if (xValue.length) {
          sliceOptions.x = sliceOption(xValue, result.columnDimensions);
        }
        if (yValue.length) {
          sliceOptions.y = sliceOption(yValue, result.rowDimensions);
        }
        return options.merge(this.slice(sliceOptions));
      }),
    );

    return new MultidimensionalDataset(result);
  }

  public transpose() {
    return new MultidimensionalDataset({
      columnDimensions: this.data.rowDimensions,
      rowDimensions: this.data.columnDimensions,
      columns: this.data.rows,
      rows: this.data.columns,
      // Transpose the data matrix
      data: this.isEmpty()
        ? []
        : Object.keys(this.data.data[0]).map(colNumber => this.data.data.map(rowNumber => rowNumber[+colNumber])),
    });
  }

  public transform<U = any>(transform: TransformFunction<T, U>) {
    return new MultidimensionalDataset({
      ...this.data,
      data: this.isEmpty() ? [] : this.rows().map(row => row.cells().map(cell => transform(cell))),
    } as RawDataset<U>);
  }

  public serialize(): RawDataset<T> {
    return this.data;
  }

  public readonly(): ReadonlyDataset<T> {
    return {
      isEmpty: this.isEmpty.bind(this),
      columns: this.columns.bind(this),
      rows: this.rows.bind(this),
      columnDimensions: this.columnDimensions.bind(this),
      rowDimensions: this.rowDimensions.bind(this),
      serialize: this.serialize.bind(this),
    };
  }
}

export default MultidimensionalDataset;
