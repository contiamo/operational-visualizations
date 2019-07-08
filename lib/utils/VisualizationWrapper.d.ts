import * as React from "react";
import { Accessors } from "../shared/typings";
export interface Props {
    style?: {};
    className?: string;
    facade: any;
    accessors?: Record<string, Accessors<any>>;
    data?: any;
    config?: any;
}
declare class VisualizationWrapper extends React.Component<Props, {}> {
    private containerNode;
    private viz;
    private timerId;
    render(): JSX.Element;
    componentDidMount(): void;
    componentDidUpdate(): void;
    updateViz(): void;
    componentWillUnmount(): void;
}
export default VisualizationWrapper;
//# sourceMappingURL=VisualizationWrapper.d.ts.map