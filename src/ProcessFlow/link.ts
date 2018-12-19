import { extend, forEach, LodashExtend, LodashForEach } from "lodash/fp";
import { LinkAccessors, LinkAttrs, TNode, WithConvert } from "./typings";

class Link {
  private accessors: LinkAccessors;
  public attributes: LinkAttrs;
  public content!: () => Array<Record<string, any>>;
  public dash!: () => string;
  public label!: () => string;
  public size!: () => number;
  public source!: () => TNode;
  public sourceId!: () => string;
  public stroke!: () => string;
  public target!: () => TNode;
  public targetId!: () => string;

  constructor(linkAttributes: LinkAttrs, accessors: LinkAccessors) {
    this.accessors = accessors;
    this.attributes = this.assignAttributes(linkAttributes);
    this.assignAccessors();
  }

  private assignAttributes(linkAttributes: LinkAttrs): LinkAttrs {
    return (extend as WithConvert<LodashExtend>).convert({ immutable: false })({}, linkAttributes);
  }

  private assignAccessors() {
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((accessor: any, key: string) => {
      (this as any)[key] = () => accessor(this.attributes);
    })(this.accessors);
  }
}

export default Link;
