import chartTestCases from "./Chart";
import pieChartTestCases from "./PieChart";
import processFlowTestCases from "./ProcessFlow";
import sunburstTestCases from "./Sunburst";
import { TestSuiteGroup } from "./types";
import * as utils from "./utils";

const testGroups: TestSuiteGroup[] = [
  { folder: "Chart", title: "Charts", slug: "charts", children: chartTestCases },
  { folder: "PieChart", title: "Pie Charts", slug: "pie-charts", children: pieChartTestCases },
  { folder: "ProcessFlow", title: "Process Flow", slug: "process-flow-charts", children: processFlowTestCases },
  { folder: "Sunburst", title: "Sunburst charts", slug: "sunburst", children: sunburstTestCases },
];

export default testGroups;

export const fromPathname = utils.fromPathname(testGroups);
export const toPathname = utils.toPathname(testGroups);
export const next = utils.next(testGroups);
