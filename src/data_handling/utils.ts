import { Dataset } from "./multidimensional_dataset";

type Matrix<T> = T[][];
type ListOfTuples<T> = T[][];

/**
 * Copy one matrix over another with mutation
 *
 * start, end - [row, column]
 */
const copy = <T>({
  destination,
  source,
  start,
  end,
}: {
  destination: Matrix<T>;
  source: Matrix<T>;
  start: [number, number];
  end: [number, number];
}) => {
  for (let rowIndex = start[0]; rowIndex <= end[0]; rowIndex++) {
    for (let columnIndex = start[1]; columnIndex <= end[1]; columnIndex++) {
      // destination[rowIndex] = destination[rowIndex] || [];
      // try {
      destination[rowIndex][columnIndex] = source[rowIndex - start[0]][columnIndex - start[1]];
      // } catch (e) {
      //   console.error(`Out of range [${rowIndex}][${columnIndex}]`);
      //   destination[rowIndex][columnIndex] = null as any;
      // }
    }
  }
};

const getColumn = <T>(m: Matrix<T>, column: number) => {
  const result: T[] = [];
  for (let rowIndex = 0; rowIndex < m.length; rowIndex++) {
    result[rowIndex] = m[rowIndex][column];
  }
  return result;
};

const unique = <T>(a: T[]): T[] => [...new Set(a)];

/**
 * transpose matrix
 */
const transpose = <T>(m: Matrix<T>) => {
  const rows = m.length;
  const columns = m[0].length;
  const result = matrix(columns, rows);
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      result[columnIndex][rowIndex] = m[rowIndex][columnIndex];
    }
  }
  return result;
};

/**
 * Constructs empty matrix
 *
 * @param rows
 * @param columns
 */
const matrix = (rows: number, columns: number): Matrix<any> =>
  Array.from({ length: rows }, () => Array.from({ length: columns }, () => null));

/**
 * helper function to visually debug Dataset
 *
 * returns matrix
 *
 * +---------------------------+
 * |      | transpose(columns) |
 * +---------------------------+
 * | rows | data               |
 * +---------------------------+
 *
 * use it in conjunction with console.table
 */
export const visualiseDataset = <T>(dataset: Dataset<T>): Matrix<T | string | null> => {
  const raw = dataset.serialize();
  const height = raw.rows.length + raw.columns[0].length;
  const width = raw.rows[0].length + raw.data[0].length;
  const result = matrix(height, width);

  copy({
    destination: result,
    source: raw.rows,
    start: [raw.columns[0].length, 0],
    end: [height - 1, raw.rows[0].length - 1],
  });

  copy({
    destination: result,
    source: transpose(raw.columns),
    start: [0, raw.rows[0].length],
    end: [raw.columns[0].length - 1, width - 1],
  });

  copy({
    destination: result,
    source: raw.data,
    start: [raw.columns[0].length, raw.rows[0].length],
    end: [height - 1, width - 1],
  });

  return result;
};

/**
 * Converts Dataset to tabular (list of tuples) represenatation
 */
export const toTabular = <T>(dataset: Dataset<T>): ListOfTuples<T | string | null> => {
  const raw = dataset.serialize();
  const height = raw.rows.length;

  // Let's assume measures are always in columns - the last one
  // We can check if measures are in columns, if not we can transpose dataset
  const measures = unique(getColumn(raw.columns, raw.columns[0].length - 1));
  const width = raw.rows[0].length + raw.columns[0].length - 1 + measures.length;

  const result = matrix((height * raw.columns.length) / measures.length, width);

  for (let supRowIndex = 0; supRowIndex < raw.columns.length / measures.length; supRowIndex++) {
    copy({
      destination: result,
      source: raw.rows,
      start: [supRowIndex * height, 0],
      end: [(supRowIndex + 1) * height - 1, raw.rows[0].length - 1],
    });

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
      for (let columnIndex = 0; columnIndex < raw.columns[0].length - 1; columnIndex++) {
        result[rowIndex + supRowIndex * height][raw.rows[0].length + columnIndex] =
          raw.columns[supRowIndex * measures.length][columnIndex];
      }
      for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
        result[rowIndex + supRowIndex * height][raw.rows[0].length + measureIndex + raw.columns[0].length - 1] =
          raw.data[rowIndex][measureIndex + supRowIndex];
      }
    }
  }

  return result;
};
