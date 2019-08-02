// this is not circular dependency, because we use DataFrame as type
import { DataFrame } from "./DataFrame";
import { FragmentFrame } from "./FragmentFrame";
import { GroupProps, DimensionValue } from "./types";
import { isCursor } from "./utils";
import { getData } from "./secret";
import { buildIndex } from "./buildIndex";

// GroupFrame is similar to PivotFrame, excapt that PivotFrame has two indexes - rows and columns
// and GroupFrame has only one index - rowIndex
export class GroupFrame<Name extends string = string> {
  private readonly prop: GroupProps<Name>;
  private readonly origin: DataFrame<Name> | FragmentFrame<Name>;

  private rowIndex!: number[][];
  private uniqueValues!: DimensionValue[][];
  private groups!: FragmentFrame<Name>[];

  constructor(origin: DataFrame<Name> | FragmentFrame<Name>, prop: GroupProps<Name>) {
    this.origin = origin;
    this.prop = prop;
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  // this is reverse operation of groupBy in the DataFrame
  public ungroup() {
    return this.origin;
  }

  public map<A>(callback: (row: FragmentFrame<Name>, index: number) => A): Array<A> {
    if (!this.rowIndex) {
      this.buildIndex();
    }
    if (!this.groups) {
      this.groups = this.rowIndex.map(i => new FragmentFrame(this.origin, i));
    }
    return this.groups.map(callback);
  }

  public unique() {
    if (!this.uniqueValues) {
      this.buildIndex();
    }
    return this.uniqueValues;
  }

  private buildIndex() {
    const columnCursors = this.prop.map(c => (isCursor(c) ? c : this.getCursor(c)));

    // If no columns are provided, returns an array with the current frame as the sole entry.
    if (columnCursors.length === 0) {
      const [, data, index] = this.origin[getData]();
      this.rowIndex = [index ? index : data.map((_, i) => i)];
      this.uniqueValues = [];
    } else {
      const { index, uniqueValues } = buildIndex(this.origin, columnCursors);
      this.rowIndex = index;
      this.uniqueValues = uniqueValues;
    }
  }
}

// don't ask me why (facepalm)
export const isGroupFrame =
  typeof window === "undefined" || navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")
    ? (x: any): x is GroupFrame => x.constructor.name === "GroupFrame"
    : (x: any): x is GroupFrame => x instanceof GroupFrame;
