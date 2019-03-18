import theme from "../utils/constants";
import { DefaultGridConfig } from "./types";

const COLUMN_WIDTH: number = 150;
const LINE_HEIGHT: number = 30;

const defaultGridConfig: DefaultGridConfig = {
  dimensionTitle: {
    hide: false,
    color: theme.font.color,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.axis.rules,
    lineHeight: LINE_HEIGHT,
  },
  dimensionLabel: {
    color: theme.font.color,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.axis.rules,
    lineHeight: LINE_HEIGHT,
  },
  rowHeaders: {
    orientation: "horizontal",
    columnWidths: COLUMN_WIDTH,
  },
  cells: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.axis.rules,
    borderWidth: "1",
    color: theme.font.color,
  },
  columns: {
    width: COLUMN_WIDTH,
  },
  rows: {
    height: LINE_HEIGHT,
  },
};

export default defaultGridConfig;
