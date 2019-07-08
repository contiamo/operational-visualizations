import * as React from "react";
export interface Props {
    timeout: number;
    onCompleted?: () => void;
    test: (testEnvironment: MarathonEnvironment) => void;
    children: (renderer: MarathonRenderer) => React.ReactNode;
}
export interface State {
    id: number;
    tests: Test[];
    completed: number;
}
export interface MarathonRenderer {
    ref: (node: HTMLElement) => void;
    results: Array<{
        description: string;
        isCompleted: boolean;
        errors: string[];
    }>;
}
export interface MarathonEnvironment {
    test: (description: string, done?: () => void) => void;
    expect: (expected: any) => {
        toBe: any;
    };
    beforeEach: (fn: any) => void;
    afterEach: (fn: any) => void;
    beforeAll: (fn: any) => void;
    afterAll: (fn: any) => void;
    container: any;
}
export interface Test {
    description: string;
    errors: string[];
}
declare class Marathon extends React.Component<Props, State> {
    constructor(props: Props);
    static defaultProps: {
        timeout: number;
    };
    state: {
        tests: Test[];
        completed: number;
        id: number;
    };
    private container;
    private tests;
    private setStateById;
    private test;
    private expect;
    private beforeEach?;
    private afterEach?;
    private beforeAll?;
    private afterAll?;
    private runNext;
    private startTests;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    render(): React.ReactNode;
}
export default Marathon;
//# sourceMappingURL=index.d.ts.map