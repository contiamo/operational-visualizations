import { extend, forEach, LodashExtend, LodashForEach } from "lodash/fp";
import { NodeAccessors, NodeAttrs, TLink, WithConvert } from "./typings";

class Node {
  private accessors: NodeAccessors;
  public attributes: NodeAttrs;
  public journeyEnds: number = 0;
  public journeyStarts: number = 0;
  public singleNodeJourneys: number = 0;
  public color!: () => string;
  public content!: () => Array<Record<string, any>>;
  public id!: () => string;
  public label!: () => string;
  public labelPosition!: () => string;
  public shape!: () => string;
  public size!: () => number;
  public sourceLinks!: TLink[];
  public stroke!: () => string;
  public targetLinks!: TLink[];
  public x!: number;
  public y!: number;

  constructor(nodeAttributes: NodeAttrs, accessors: NodeAccessors) {
    this.accessors = accessors;
    this.attributes = this.assignAttributes(nodeAttributes);
    this.assignAccessors();
  }

  private assignAttributes(nodeAttributes: NodeAttrs): NodeAttrs {
    return (extend as WithConvert<LodashExtend>).convert({ immutable: false })({})(nodeAttributes);
  }

  private assignAccessors() {
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((accessor: any, key: string) => {
      (this as any)[key] = () => accessor(this.attributes);
    })(this.accessors);
  }
}

export default Node;
