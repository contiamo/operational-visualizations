import { Dataset } from "./multidimensional_dataset";

type Matrix<T> = T[][];

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
      destination[rowIndex][columnIndex] = source[rowIndex - start[0]][columnIndex - start[1]];
    }
  }
};

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
export const visualiseDataset = <T>(dataset: Dataset<T>): any => {
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
