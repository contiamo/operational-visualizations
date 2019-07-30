// this is not circular dependency, because we use DataFrame as type
import { DataFrame } from "./DataFrame";
import { FragmentFrame } from "./FragmentFrame";

export class GroupedFrame<Name extends string = string> {
  private readonly index: number[][];
  private readonly origin: DataFrame<Name>;
  private groups: FragmentFrame<Name>[] | undefined;

  constructor(origin: DataFrame<Name>, index: number[][]) {
    this.origin = origin;
    this.index = index;
  }

  public map<A>(callback: (row: FragmentFrame<Name>, index: number) => A): Array<A> {
    if (!this.groups) {
      this.groups = this.index.map(i => new FragmentFrame(this.origin, i));
    }
    return this.groups.map(callback);
  }
}
