import { hierarchy as d3Hierarchy, HierarchyNode, partition as d3Partition } from "d3-hierarchy";
import { filter, flow, forEach, isEmpty, LodashForEach, map, reduce } from "lodash/fp";

import {
  Accessor,
  Data,
  HierarchyDatum,
  ProcessedData,
  SeriesAccessors,
  State,
  StateWriter,
  WithConvert,
} from "./typings";

class DataHandler {
  private color!: (d: Data) => string;
  private data!: HierarchyDatum[];
  private id!: (d: Data) => string;
  private name!: (d: Data) => string;
  private state: State;
  private stateWriter: StateWriter;
  private value!: (d: Data) => number;
  public topNode!: HierarchyDatum;

  constructor(state: State, stateWriter: StateWriter) {
    this.state = state;
    this.stateWriter = stateWriter;
  }

  private assignAccessors() {
    const accessors: SeriesAccessors = this.state.current.getAccessors().series;

    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((accessor: Accessor<Data, any>, key: string) => {
      (this as any)[key] = (d: Data) => accessor(d);
    })(accessors);
  }

  public prepareData() {
    this.assignAccessors();

    const data = this.state.current.getAccessors().data.data(this.state.current.getData()) || {};

    const sortingFunction = (a: HierarchyNode<Data>, b: HierarchyNode<Data>) => {
      // Empty segments should always be last
      if (a.data.empty || !a.data.value) {
        return 1;
      }
      if (b.data.empty || !b.data.value) {
        return -1;
      }
      // Sort largest to smallest
      return b.data.value - a.data.value;
    };

    const processedData = flow(
      (d: Data) => this.assignColors(d),
      this.assignNames.bind(this),
      this.assignIDs.bind(this),
      this.assignZoomable.bind(this),
      this.assignValues.bind(this),
    )(data);

    const hierarchyData = d3Hierarchy(processedData).sort(
      this.state.current.getConfig().sort ? sortingFunction : () => -1,
    );

    this.topNode = d3Partition<ProcessedData>()(hierarchyData)
      .descendants()
      .find(d => d.depth === 0) as HierarchyDatum;

    this.stateWriter("topNode", this.topNode);

    this.data = d3Partition<ProcessedData>()(hierarchyData)
      .descendants()
      .filter(d => !isEmpty(d.data));

    this.checkDataValidity();

    this.stateWriter("data", this.data);
    return this.data;
  }

  private assignColors(node: Data, i: number = 0, parentColor?: string) {
    const propagateColors = this.state.current.getConfig().propagateColors;
    node.color = node.empty
      ? "#fff"
      : propagateColors && parentColor
      ? parentColor
      : i > 0
      ? this.color(node)
      : undefined;

    forEach((child: Data) => this.assignColors(child, i + 1, node.color))(node.children);
    return node as Pick<ProcessedData, "empty" | "color">;
  }

  private assignNames(node: Data) {
    node.name = this.name(node);
    forEach((child: Data) => this.assignNames(child))(node.children);
    return node as Pick<ProcessedData, "empty" | "color" | "name">;
  }

  private assignIDs(node: Data) {
    node.id = this.id(node);
    forEach((child: Data) => this.assignIDs(child))(node.children);
    return node as Pick<ProcessedData, "empty" | "color" | "name" | "id">;
  }

  private assignZoomable(node: Data) {
    node.zoomable = !!node.children;
    forEach((child: Data) => this.assignZoomable(child))(node.children);
    return node as Pick<ProcessedData, "empty" | "color" | "name" | "id" | "zoomable">;
  }

  private assignValues(node: Data) {
    const assignedValue = +this.value(node);
    const sumOfChildren = reduce((sum: number, child: Data) => (sum = sum + this.assignValues(child).value), 0)(
      node.children || [],
    );
    node.value = assignedValue || sumOfChildren;
    return node as ProcessedData;
  }

  private checkDataValidity() {
    // All data points must have a value assigned
    const noValueData: HierarchyDatum[] = filter((d: HierarchyDatum) => !d.data.value)(this.data);

    if (this.data.length > 1 && noValueData.length > 0) {
      throw new Error(
        `The following nodes do not have values: ${map((d: HierarchyDatum) => this.name(d.data))(noValueData)}`,
      );
    }

    // Parent nodes cannot be smaller than the sum of their children
    const childrenExceedParent = filter((d: HierarchyDatum) => {
      const childSum = reduce((sum: number, child: HierarchyDatum) => sum + child.data.value, 0)(d.children || []);
      return d.data.value < childSum;
    })(this.data);

    if (childrenExceedParent.length > 0) {
      throw new Error(
        `The following nodes are smaller than the sum of their child nodes: ${map((d: HierarchyDatum) =>
          this.name(d.data),
        )(childrenExceedParent)}`,
      );
    }
  }
}

export default DataHandler;
