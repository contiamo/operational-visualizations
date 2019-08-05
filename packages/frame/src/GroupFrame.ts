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

  private rowIndex: number[][] | undefined;
  private unique: DimensionValue[][] | undefined;
  private groups: FragmentFrame<Name>[] | undefined;

  constructor(origin: DataFrame<Name> | FragmentFrame<Name>, prop: GroupProps<Name>) {
    this.origin = origin;
    this.prop = prop;
  }

  public getCursor(column: Name) {
    return this.origin.getCursor(column);
  }

  // reverse operation of groupBy in the DataFrame
  public ungroup() {
    return this.origin;
  }

  public map<A>(callback: (row: FragmentFrame<Name>, index: number) => A): Array<A> {
    if (!this.rowIndex) {
      this.buildIndex();
    }
    if (!this.rowIndex) {
      // we assign rowIndex inside buildIndex, but TS can't trace it
      // so we need to proof to TS that rowIndex is not undefined
      throw new Error("Never happens");
    }
    if (!this.groups) {
      this.groups = this.rowIndex.map(i => new FragmentFrame(this.origin, i));
    }
    return this.groups.map(callback);
  }

  public uniqueValues(): DimensionValue[][] {
    if (!this.unique) {
      this.buildIndex();
    }
    if (!this.unique) {
      // we assign unique inside buildIndex, but TS can't trace it
      // so we need to proof to TS that unique is not undefined
      throw new Error("Never happens");
    }
    return this.unique;
  }

  private buildIndex() {
    const columnCursors = this.prop.map(c => (isCursor(c) ? c : this.getCursor(c)));

    // If no columns are provided, returns an array with the current frame as the sole entry.
    if (columnCursors.length === 0) {
      const [, data, index] = this.origin[getData]();
      this.rowIndex = [index ? index : data.map((_, i) => i)];
      this.unique = [];
    } else {
      const { index, uniqueValues } = buildIndex(this.origin, columnCursors);
      this.rowIndex = index;
      this.unique = uniqueValues;
    }
  }
}

// For unknown for me reason `x instanceof GroupFrame` doesn't work in Node.js.
// To fix this we check if we run inside Node.js or Jest and use alternative way to detect GroupFrame
export const isGroupFrame =
  typeof window === "undefined" || navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")
    ? (x: any): x is GroupFrame => x.constructor.name === "GroupFrame"
    : (x: any): x is GroupFrame => x instanceof GroupFrame;
