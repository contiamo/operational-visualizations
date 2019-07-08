import * as React from "react";
export interface Props {
    pushState: (path: string) => void;
    pathname: string;
}
export interface State {
    isLooping: boolean;
}
declare class VisualTests extends React.Component<Props, State> {
    state: {
        isLooping: boolean;
    };
    syncPath(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
}
export default VisualTests;
//# sourceMappingURL=VisualTests.d.ts.map