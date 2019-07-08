import { LinkAccessors, LinkAttrs, TNode } from "./typings";
declare class Link {
    private accessors;
    attributes: LinkAttrs;
    content: () => Array<Record<string, any>>;
    dash: () => string;
    label: () => string;
    size: () => number;
    source: () => TNode;
    sourceId: () => string;
    stroke: () => string;
    target: () => TNode;
    targetId: () => string;
    constructor(linkAttributes: LinkAttrs, accessors: LinkAccessors);
    private assignAttributes;
    private assignAccessors;
}
export default Link;
//# sourceMappingURL=link.d.ts.map