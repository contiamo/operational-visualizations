import * as React from "react";

export interface Props {
  timeout: number;
  onCompleted?: () => void;
  test: (testEnvironment: MarathonEnvironment) => void;
  children: (renderer: MarathonRenderer) => React.ReactNode;
}

export interface State {
  // The id of the current running test, incrementing every time a new test prop is passed
  // this is necessary to intercept and abandon any asynchronous operations
  // within a test that has been swapped out.
  id: number;
  // A test object that contains all `test(...)` definitions
  tests: Test[];
  completed: number;
}

export interface MarathonRenderer {
  ref: (node: HTMLElement) => void;
  results: Array<{ description: string; isCompleted: boolean; errors: string[] }>;
}

type TestFn = (done?: ((a: any) => void)) => void;

// Methods available inside test definitions.
export interface MarathonEnvironment {
  test: (description: string, done?: () => void) => void;
  expect: (expected: any) => { toBe: any };
  beforeEach: (fn: any) => void;
  afterEach: (fn: any) => void;
  beforeAll: (fn: any) => void;
  afterAll: (fn: any) => void;
  container: any;
}

interface TestWithRunner {
  description: string;
  fn: TestFn;
}

export interface Test {
  description: string;
  errors: string[];
}

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

class Marathon extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public static defaultProps = {
    timeout: 2000,
  };

  public state = {
    tests: [] as Test[],
    completed: 0,
    id: 0,
  };

  private container!: HTMLElement;

  private tests: TestWithRunner[] = [];

  private setStateById = (
    updater: (prevState: State, props: Props) => { id: number },
    ignoreId?: boolean,
  ): Promise<void> => {
    // If the test id's don't match, it means that the setState is called from an uncleared timeout or async action from an old test.
    const tentativeNewState = updater(this.state, this.props);
    return new Promise((resolve, reject) => {
      if (!ignoreId && tentativeNewState.id !== this.state.id) {
        return reject(
          `setStateById error - ignoreId: ${ignoreId}, tentativeNewState.id: ${tentativeNewState.id}, this.state.id: ${
            this.state.id
          }`,
        );
      }
      this.setState(updater, () => {
        resolve();
      });
    });
  };

  private test = (description: string, fn: (done?: ((a: any) => void)) => void): void => {
    this.tests.push({ description, fn });
  };

  private expect = (actual: any): { toBe: any } => {
    return {
      toBe: (expected: any): void => {
        const error = actual === expected ? null : `Expected ${String(actual)} to equal ${String(expected)}`;
        this.setStateById(({ id, tests, completed }: State) => ({
          id,
          tests: tests.map((test, index) =>
            index === completed ? { ...test, errors: [...test.errors, error] } : test,
          ),
        }));
      },
    };
  };

  // Test lifecycle callbacks
  private beforeEach?: () => void;
  private afterEach?: () => void;
  private beforeAll?: () => void;
  private afterAll?: () => void;

  private runNext = async () => {
    const { completed } = this.state;
    const { timeout } = this.props;
    const test = this.tests[completed];

    if (!test) {
      return;
    }

    const actualTimeout = completed === 0 ? 100 : timeout;

    const currentTestId = this.state.id;

    if (test.fn.length === 0) {
      await sleep(actualTimeout);
      try {
        if (!!this.beforeEach) {
          this.beforeEach();
        }
        test.fn();
        if (!!this.afterEach) {
          this.afterEach();
        }
      } catch (err) {
        await this.setStateById(prevState => ({
          id: currentTestId,
          tests: prevState.tests.map((t: Test, index: number) =>
            index === prevState.completed ? { ...t, errors: [...t.errors, String(err)] } : t,
          ),
        }));
      }
      try {
        await this.setStateById((prevState: State) => ({ id: currentTestId, completed: prevState.completed + 1 }));
        this.runNext();
      } catch (err) {
        if (err.toString().startsWith("setStateById")) {
          // ignore
        } else {
          throw err;
        }
      }
      return;
    }
    await sleep(actualTimeout);
    if (!!this.beforeEach) {
      this.beforeEach();
    }
    test.fn(async () => {
      if (!!this.afterEach) {
        this.afterEach();
      }
      try {
        await this.setStateById(prevState => ({ id: currentTestId, completed: prevState.completed + 1 }));
        this.runNext();
      } catch (err) {
        if (err.toString().startsWith("setStateById")) {
          // ignore
        } else {
          throw err;
        }
      }
    });
  };

  private startTests() {
    this.tests = [];

    // Run client-provided test function, injecting test methods (test, expect, ...)
    this.props.test({
      test: this.test,
      expect: this.expect,
      container: this.container,
      beforeEach: (fn: any): void => {
        this.beforeEach = fn;
      },
      afterEach: (fn: any): void => {
        this.beforeEach = fn;
      },
      beforeAll: (fn: any): void => {
        this.beforeAll = fn;
      },
      afterAll: (fn: any): void => {
        this.afterAll = fn;
      },
    } as any);

    // Pin the test array on state, run first one when ready.
    this.setStateById((prevState: State) => ({
      id: prevState.id,
      tests: this.tests.map(test => ({ description: test.description, errors: [] })),
    })).then(() => {
      if (!!this.beforeAll) {
        this.beforeAll();
      }
      this.runNext();
    });
  }

  public componentDidMount() {
    this.startTests();
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.test !== this.props.test) {
      if (!!this.afterAll) {
        this.afterAll();
      }
      this.beforeEach = undefined;
      this.afterEach = undefined;
      this.beforeAll = undefined;
      this.afterAll = undefined;
      this.container.innerHTML = "";
      this.setStateById(
        prevState => ({
          id: prevState.id + 1,
          tests: [],
          completed: 0,
          // Set ignoreId flag to true to proceed with the state update even though test ids don't match.
        }),
        true,
      ).then(() => {
        this.startTests();
      });
      return;
    }
    if (this.state.completed === this.state.tests.length && this.state.completed !== 0 && this.props.onCompleted) {
      this.props.onCompleted();
    }
  }

  public render() {
    return this.props.children({
      results: this.state.tests.map((test, index) => ({
        description: test.description,
        isCompleted: this.state.completed > index,
        errors: test.errors,
      })),
      ref: (node: HTMLElement) => {
        this.container = node;
      },
    });
  }
}

export default Marathon;
