import { TestSuiteGroup } from "./types";
declare const testGroups: TestSuiteGroup[];
export default testGroups;
export declare const fromPathname: (pathname: string) => import("./types").CurrentTestSuite;
export declare const toPathname: (currentTestSuite: import("./types").CurrentTestSuite) => string;
export declare const next: (currentTestSuite: import("./types").CurrentTestSuite) => import("./types").CurrentTestSuite;
//# sourceMappingURL=index.d.ts.map