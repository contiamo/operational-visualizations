import { NodeAccessors, NodeAttrs, TLink } from "./typings";
declare class Node {
    private accessors;
    attributes: NodeAttrs;
    journeyEnds: number;
    journeyStarts: number;
    singleNodeJourneys: number;
    color: () => string;
    content: () => Array<Record<string, any>>;
    id: () => string;
    label: () => string;
    labelPosition: () => string;
    shape: () => string;
    size: () => number;
    sourceLinks: TLink[];
    stroke: () => string;
    targetLinks: TLink[];
    x: number;
    y: number;
    constructor(nodeAttributes: NodeAttrs, accessors: NodeAccessors);
    private assignAttributes;
    private assignAccessors;
}
export default Node;
//# sourceMappingURL=node.d.ts.map