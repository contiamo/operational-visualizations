import { TestSuiteGroup, CurrentTestSuite } from "./types"

/*
 * Returns the index of the first element that matches a condition.
 */
const findIndex = (condition: (member: any, index: number) => boolean) => (array: any[]): number | null => {
  const match = array
    .map((member, index) => (condition(member, index) ? [member, index] : null))
    .filter(memberWithIndex => memberWithIndex !== null)[0]
  if (!match) {
    return null
  }
  return match[1] as number
}

/**
 * Finds a test from the pathname, also returning whether an exact path match was found so that a redirct may take place.
 */
export const fromPathname = (testGroups: TestSuiteGroup[]) => (pathname: string): CurrentTestSuite => {
  const defaultTest = {
    groupIndex: 0,
    testIndex: 0,
  }
  // Since "/visual-tests/abc/def" splits to [ "", "visual-tests", "abc", "def" ], ignore the first two results
  const [_a, _b, groupSlug, testSlug] = pathname.split("/")
  if (!groupSlug) {
    return defaultTest
  }
  const groupIndex = findIndex((testCase, index) => testCase.slug === groupSlug)(testGroups)
  if (groupIndex === null) {
    return defaultTest
  }
  if (!testSlug) {
    return {
      groupIndex,
      testIndex: 0,
    }
  }
  const group = testGroups[groupIndex] as any
  const testIndex = findIndex(({ slug }, index) => slug === testSlug)(group.children)
  if (testIndex === null) {
    return {
      groupIndex,
      testIndex: 0,
    }
  }
  return {
    groupIndex,
    testIndex,
    exactPath: true,
  }
}

export const toPathname = (testGroups: TestSuiteGroup[]) => (currentTestSuite: CurrentTestSuite): string => {
  const pathname = `/visual-tests/${testGroups[currentTestSuite.groupIndex].slug}/${
    testGroups[currentTestSuite.groupIndex].children[currentTestSuite.testIndex].slug
  }`
  return pathname
}

export const next = (testGroups: TestSuiteGroup[]) => (currentTestSuite: CurrentTestSuite): CurrentTestSuite => {
  return {
    groupIndex: currentTestSuite.groupIndex,
    testIndex: currentTestSuite.testIndex + 1,
  }
}
