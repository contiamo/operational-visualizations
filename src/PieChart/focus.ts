import ComponentFocus from "../shared/component_focus";
import Events from "../shared/event_catalog";
import { drawHidden, labelDimensions, positionLabel } from "../utils/focus_utils";
import { D3Selection, EventEmitter, Focus, HoverPayload, State, StateWriter } from "./typings";

const percentageString = (percentage: number): string => percentage.toFixed(1) + "%";

class PieChartFocus implements Focus {
  private el: D3Selection;
  private componentFocus: ComponentFocus;
  private state: State;
  private events: EventEmitter;

  constructor(state: State, _: StateWriter, events: EventEmitter, els: { [key: string]: D3Selection }) {
    this.state = state;
    this.events = events;
    this.el = els.main;
    this.componentFocus = new ComponentFocus(this.state, els.component, this.events);
    this.events.on(Events.FOCUS.ELEMENT.HOVER, this.onElementHover.bind(this));
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.onElementOut.bind(this));
    this.events.on(Events.CHART.OUT, this.onMouseLeave.bind(this));
    this.events.on(Events.FOCUS.CLEAR, this.remove.bind(this));
  }

  private onElementHover(payload: HoverPayload) {
    this.remove();

    drawHidden(this.el, "element");

    const label = this.el.append("xhtml:ul");

    label
      .append("xhtml:li")
      .attr("class", "title")
      .text(payload.d.key);

    label
      .append("xhtml:li")
      .attr("class", "series")
      .html(
        `<span class="value">${payload.d.value}</span>
        <span class="percentage">(${percentageString(payload.d.percentage)})</span>`,
      );

    const labelDims = labelDimensions(this.el);
    const drawingContainerDims = this.state.current.getComputed().canvas.drawingContainerDims;

    const drawingDimensions = {
      xMin: 0,
      yMin: this.state.current.getConfig().height - drawingContainerDims.height,
      xMax: drawingContainerDims.width,
      yMax: this.state.current.getConfig().height,
    };

    const focus = { x: payload.focusPoint.centroid[0], y: payload.focusPoint.centroid[1] };
    positionLabel(this.el, focus, labelDims, drawingDimensions, this.state.current.getConfig().focusOffset, "above");
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
    this.componentFocus.remove();
  }
}

export default PieChartFocus;
