import { CurrentTestSuite, TestSuiteGroup } from "./types";

/**
 * Finds a test from the pathname, also returning whether an exact path match was found so that a redirct may take place.
 */
export const fromPathname = (testGroups: TestSuiteGroup[]) => (pathname: string): CurrentTestSuite => {
  const defaultTest = {
    groupIndex: 0,
    testIndex: 0,
  };
  // Since "/visual-tests/abc/def" splits to [ "", "visual-tests", "abc", "def" ], ignore the first two results
  const [groupSlug, testSlug] = pathname.split("/").slice(2);
  if (!groupSlug) {
    return defaultTest;
  }
  const groupIndex = testGroups.findIndex(testCase => testCase.slug === groupSlug);
  if (!groupIndex === null) {
    return defaultTest;
  }
  if (!testSlug) {
    return {
      groupIndex,
      testIndex: 0,
    };
  }
  const group = testGroups[groupIndex] as any;
  const testIndex = group.children.findIndex(({ slug }: any) => slug === testSlug);
  if (testIndex === null) {
    return {
      groupIndex,
      testIndex: 0,
    };
  }
  return {
    groupIndex,
    testIndex,
    exactPath: true,
  };
};

export const toPathname = (testGroups: TestSuiteGroup[]) => (currentTestSuite: CurrentTestSuite): string => {
  const pathname = `/visual-tests/${testGroups[currentTestSuite.groupIndex].slug}/${
    testGroups[currentTestSuite.groupIndex].children[currentTestSuite.testIndex].slug
  }`;
  return pathname;
};

export const next = () => (currentTestSuite: CurrentTestSuite): CurrentTestSuite => {
  return {
    groupIndex: currentTestSuite.groupIndex,
    testIndex: currentTestSuite.testIndex + 1,
  };
};
