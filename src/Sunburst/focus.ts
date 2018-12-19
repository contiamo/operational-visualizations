import Events from "../shared/event_catalog";
import { drawHidden, labelDimensions, positionLabel } from "../utils/focus_utils";
import { D3Selection, EventBus, Focus, HierarchyDatum, HoverPayload, State, StateWriter } from "./typings";

const dataName = (d: HierarchyDatum) => d.data.name || "";
const dataValue = (d: HierarchyDatum) => d.data.value;

class SunburstFocus implements Focus {
  private el: D3Selection;
  private state: State;
  private events: EventBus;

  constructor(state: State, _: StateWriter, events: EventBus, el: D3Selection) {
    this.state = state;
    this.events = events;
    this.el = el;
    this.events.on(Events.FOCUS.ELEMENT.HOVER, this.onElementHover.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.onElementOut.bind(this));
    this.events.on(Events.CHART.OUT, this.onMouseLeave.bind(this));
  }

  private onElementHover(payload: HoverPayload) {
    this.remove();

    if (payload.hideLabel) {
      return;
    }

    const computed = this.state.current.getComputed();
    const datum = payload.d;
    const focusPoint = payload.focusPoint;

    if (datum === computed.renderer.topNode) {
      return;
    }

    drawHidden(this.el, "element");

    const content = this.el.append("xhtml:ul");

    content
      .append("span")
      .attr("class", "title")
      .text(dataName(datum));

    content.append("span").text(`(${this.state.current.getConfig().numberFormatter(dataValue(datum))})`);

    content.append("xhtml:li").text(this.percentageString(datum));

    const focus = { x: focusPoint.centroid[0], y: focusPoint.centroid[1] };
    const labelDims = labelDimensions(this.el);
    const drawingDims = this.state.current.getComputed().canvas.drawingDims;
    const drawingDimensions = {
      xMin: 0,
      yMin: this.state.current.getConfig().height - drawingDims.height,
      xMax: drawingDims.width,
      yMax: drawingDims.height,
    };

    positionLabel(
      this.el,
      focus,
      labelDims,
      drawingDimensions,
      this.state.current.getConfig().focusOffset,
      focusPoint.labelPosition,
    );
  }

  private percentageString(datum: HierarchyDatum) {
    const computed = this.state.current.getComputed();
    const topNode = computed.renderer.topNode;
    const zoomNode = computed.renderer.zoomNode;
    return !zoomNode || topNode === zoomNode
      ? `${this.singlePercentageString(datum, topNode)}`
      : `${this.singlePercentageString(datum, zoomNode)} / ${this.singlePercentageString(datum, topNode)}`;
  }

  private singlePercentageString(datum: HierarchyDatum, comparison?: HierarchyDatum) {
    if (!comparison) {
      return "";
    }
    const percentage = ((dataValue(datum) * 100) / dataValue(comparison)).toPrecision(3);
    return `${percentage}% of ${dataName(comparison)}`;
  }

  private onElementOut() {
    this.remove();
  }

  private onMouseLeave() {
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  public remove() {
    this.el.node().innerHTML = "";
    this.el.style("visibility", "hidden");
  }
}

export default SunburstFocus;
