import { D3Selection } from "../shared/typings";

export const stepFunction = (element: D3Selection, availableWidth: number) => (x: number) => {
  element.style("font-size", `${x}px`);
  return availableWidth - element.node().getBoundingClientRect().width;
};

// y is a step-function (with two x values resulting in the same y value)
// on the positive integer domain which is monotonic decreasing
export const approxZero = (y: (x: number) => number, initialX: number) => {
  // make sure to get points with different y value
  const p0 = { x: initialX, y: y(initialX) };
  const p1 = { x: initialX + 2, y: y(initialX + 2) };

  // Solve for 0
  const m = (p0.y - p1.y) / (p0.x - p1.x);
  const xZero = -p0.y / m + p0.x;

  // Find nearest integer value for x that has y > 0
  let xInt = Math.round(xZero);
  for (let i = 0; i <= 10; i = i + 1) {
    if (y(xInt) <= 0) {
      xInt = xInt - 1;
    }
  }

  return xInt;
};
