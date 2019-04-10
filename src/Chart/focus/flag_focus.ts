import Events from "../../shared/event_catalog";
import { drawHidden, drawVisible, labelDimensions } from "../../utils/focus_utils";
import { AxisPosition, D3Selection, EventEmitter, State } from "../typings";
import * as styles from "./styles";

class FlagFocus {
  private events: EventEmitter;
  private state: State;
  private el: D3Selection;

  constructor(state: State, el: D3Selection, events: EventEmitter) {
    this.state = state;
    this.el = el;
    this.events = events;
    this.events.on(Events.FOCUS.FLAG.HOVER, this.draw.bind(this));
    this.events.on(Events.FOCUS.FLAG.OUT, this.remove.bind(this));
  }

  // Focus Label (hidden initially)
  private draw(focusData: any) {
    // Remove old focus (may also be a different type of focus)
    this.events.emit(Events.FOCUS.CLEAR);

    this.el.classed("flag", true).style("max-width", this.state.current.getConfig().maxFocusLabelWidth);

    drawHidden(this.el, "flag");

    const content = this.el.append("xhtml:ul").attr("class", styles.flagFocus);

    const name =
      focusData.axisType !== "quant"
        ? `${focusData.formatter(focusData.datum)}: ${focusData.label}`
        : `${focusData.label}: ${focusData.formatter(focusData.datum)}`;

    content
      .append("xhtml:li")
      .attr("class", "name")
      .html(name);

    content
      .append("xhtml:li")
      .attr("class", "description")
      .html(focusData.description);

    // Draw line between label title and description.
    content.select("li.name").style("border-bottom", `1px solid ${focusData.color}`);

    // Get label dimensions
    const labelDims = labelDimensions(this.el);
    const offset = this.state.current.getConfig().flagFocusOffset;

    const labelPosition = {
      left: focusData.x + this.margin("y1") + this.focusDX(focusData, labelDims.width, offset),
      top: focusData.y + this.margin("x2") + this.focusDY(focusData, labelDims.height, offset),
    };

    drawVisible(this.el, labelPosition);
  }

  private margin(axis: AxisPosition): number {
    return this.state.current.getComputed().axes.margins[axis] || this.state.current.getConfig()[axis].margin;
  }

  private focusDX(focusData: any, width: number, offset: number): number {
    switch (focusData.axis) {
      case "y1":
        return -width;
      case "y2":
        return 0;
      default:
        return focusData.direction === "up" ? offset : -(width + offset);
    }
  }

  private focusDY(focusData: any, height: number, offset: number): number {
    switch (focusData.axis) {
      case "x1":
        return 0;
      case "x2":
        return -height;
      default:
        return focusData.direction === "up" ? -(height + offset) : offset;
    }
  }

  public remove() {
    this.el.classed("focus-legend-flag", false);
    this.el.node().innerHTML = "";
    this.el.style("visibility", "hidden");
  }
}

export default FlagFocus;
