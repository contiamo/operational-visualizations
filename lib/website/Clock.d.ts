import React, { PureComponent } from "react";
export default class Clock extends PureComponent<{}> {
    faceRef: React.RefObject<SVGCircleElement>;
    arcGroupRef: React.RefObject<SVGGElement>;
    clockHandRef: React.RefObject<SVGPathElement>;
    frame: number | null;
    hitCounter: number;
    rotation: number;
    t0: number;
    arcs: Array<{
        rotation: number;
        td: number;
    }>;
    animate: () => void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    handleClick: (e: any) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=Clock.d.ts.map