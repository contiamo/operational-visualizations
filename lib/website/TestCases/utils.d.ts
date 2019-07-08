import { CurrentTestSuite, TestSuiteGroup } from "./types";
/**
 * Finds a test from the pathname, also returning whether an exact path match was found so that a redirct may take place.
 */
export declare const fromPathname: (testGroups: TestSuiteGroup[]) => (pathname: string) => CurrentTestSuite;
export declare const toPathname: (testGroups: TestSuiteGroup[]) => (currentTestSuite: CurrentTestSuite) => string;
export declare const next: (testGroups: TestSuiteGroup[]) => (currentTestSuite: CurrentTestSuite) => CurrentTestSuite;
//# sourceMappingURL=utils.d.ts.map