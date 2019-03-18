import theme from "../utils/constants";

export const headerStyle: React.CSSProperties = {
  fontWeight: 500,
  textAlign: "center",
  border: `1px solid`,
  overflow: "hidden",
  textOverflow: "ellipsis",
  padding: `0 ${theme.space.default}px`,
};
