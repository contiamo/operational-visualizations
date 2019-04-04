import { clone, defaults } from "lodash/fp";
import Events from "../shared/event_catalog";
import { readableTextColor } from "../utils/color";
import * as styles from "./styles";
import { ClickPayload, D3Selection, EventEmitter, HierarchyDatum, HoverPayload, State, StateWriter } from "./typings";

const ARROW_WIDTH: number = 7;
const HOPS_WIDTH: number = 40;

class Breadcrumb {
  private el: D3Selection;
  private events: EventEmitter;
  private state: State;

  constructor(state: State, _: StateWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.events = events;
    this.el = el;
    this.events.on(Events.FOCUS.ELEMENT.CLICK, this.updateHoverPath.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.HOVER, this.updateHoverPath.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.updateHoverPath.bind(this));
  }

  private updateHoverPath(payload: HoverPayload | ClickPayload) {
    // Only display breadcrumb if drawing area is wide enough.
    const config = this.state.current.getConfig();
    const maxBreadcrumbWidth: number = config.breadcrumbItemWidth * config.maxBreadcrumbLength + ARROW_WIDTH;
    if (this.state.current.getConfig().width < maxBreadcrumbWidth) {
      return;
    }

    const computed = this.state.current.getComputed().renderer;
    const fixedNode = computed.zoomNode || computed.topNode;
    if (!fixedNode || (payload.d && payload.d.data.empty)) {
      return;
    }
    const nodeArray = payload.d ? payload.d.ancestors().reverse() : fixedNode.ancestors().reverse();
    this.update(nodeArray);
  }

  private label(d: HierarchyDatum) {
    return d.data.hops ? "..." : d.data.name;
  }

  private truncateNodeArray(nodeArray: HierarchyDatum[]) {
    const maxLength = this.state.current.getConfig().maxBreadcrumbLength;
    if (nodeArray.length <= maxLength) {
      return nodeArray;
    }
    const firstNodes = nodeArray.slice(0, 1);
    const lastNodes = nodeArray.slice(nodeArray.length - (maxLength - 2));
    const dummyHopsNode = defaults({ hops: true })(clone(firstNodes[0]));
    return firstNodes.concat([dummyHopsNode]).concat(lastNodes);
  }

  private backgroundColor(d: HierarchyDatum) {
    return d.data.hops ? "#fff" : d.data.color || "#eee";
  }

  private labelColor(d: HierarchyDatum) {
    return readableTextColor(this.backgroundColor(d), ["black", "white"]);
  }

  private update(nodeArray: HierarchyDatum[]) {
    const data = nodeArray.length > 1 ? this.truncateNodeArray(nodeArray) : [];

    // Data join; key function combines name and depth (= position in sequence).
    const trail = this.el
      .selectAll(`div.${styles.breadcrumbItem}`)
      .data(data, d =>
        (d as HierarchyDatum).data.hops ? "hops" : (d as HierarchyDatum).data.name + (d as HierarchyDatum).depth,
      );

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const itemWidth = (d: HierarchyDatum) =>
      d.data.hops ? HOPS_WIDTH : this.state.current.getConfig().breadcrumbItemWidth;

    const entering: D3Selection = trail
      .enter()
      .append("div")
      .attr("class", (d: HierarchyDatum) => `${styles.breadcrumbItem} ${d.data.hops ? "hops" : ""}`)
      .style("background-color", this.backgroundColor)
      .style("width", (d: HierarchyDatum) => `${itemWidth(d)}px`)
      .attr("title", this.label);

    entering
      .append("div")
      .attr("class", "label")
      .style("width", (d: HierarchyDatum) => `${itemWidth(d) - ARROW_WIDTH * 3}px`)
      .html(this.label)
      .style("color", this.labelColor.bind(this));

    entering.append("div").attr("class", "background-arrow");

    entering
      .append("div")
      .attr("class", "arrow")
      .style("border-left-color", this.backgroundColor);

    entering.merge(trail).on("click", this.onClick.bind(this));
  }

  private onClick(d: HierarchyDatum) {
    if (d.data.hops) {
      return;
    }
    this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d });
  }
}

export default Breadcrumb;
