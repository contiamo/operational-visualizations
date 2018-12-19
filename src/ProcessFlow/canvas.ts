import * as d3 from "d3-selection";
import { forEach } from "lodash/fp";
import Events from "../shared/event_catalog";
import * as styles from "../shared/styles";
import { Canvas, D3Selection, EventBus, State, StateWriter } from "./typings";

class ProcessFlowCanvas implements Canvas {
  private chartContainer: D3Selection;
  private el: D3Selection;
  private events: EventBus;
  private state: State;
  private elMap: { [key: string]: D3Selection } = {};
  private stateWriter: StateWriter;

  constructor(state: State, stateWriter: StateWriter, events: EventBus, context: Element) {
    this.state = state;
    this.stateWriter = stateWriter;
    this.events = events;
    this.chartContainer = this.renderChartContainer(context);
    this.el = this.renderEl();
    this.renderFocus();
    this.renderDrawingGroups();
  }

  // Chart container
  private renderChartContainer(context: Element): D3Selection {
    const container: Element = document.createElementNS(d3.namespaces.xhtml, "div");
    context.appendChild(container);
    return d3
      .select(container)
      .attr("class", styles.chartContainer)
      .style("background-color", this.state.current.getConfig().backgroundColor);
  }

  // El
  private renderEl(): D3Selection {
    const el: Element = document.createElementNS(d3.namespaces.svg, "svg");
    el.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    el.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    el.addEventListener("click", this.onClick.bind(this));
    this.stateWriter("elRect", el.getBoundingClientRect());
    this.chartContainer.node().appendChild(el);
    this.elMap.series = d3.select(el);
    return d3.select(el);
  }

  private onMouseEnter() {
    this.events.emit(Events.CHART.HOVER);
  }

  private onMouseLeave() {
    this.events.emit(Events.CHART.OUT);
  }

  private onClick() {
    this.events.emit(Events.CHART.CLICK);
  }

  // Focus
  private renderFocus() {
    const focus: D3Selection = d3
      .select(document.createElementNS(d3.namespaces.xhtml, "div"))
      .attr("class", `${styles.focusLegend}`)
      .style("visibility", "hidden");
    this.chartContainer.node().appendChild(focus.node());
    this.elMap.focus = focus;
  }

  // Drawing groups
  private renderDrawingGroups() {
    forEach((group: string) => {
      this.el.append("svg:g").attr("class", `${group}-group`);
    })(["links", "nodes"]);
  }

  // Lifecycle
  public draw() {
    this.chartContainer.classed("hidden", this.state.current.getConfig().hidden);
    this.stateWriter(["containerRect"], this.chartContainer.node().getBoundingClientRect());
  }

  public remove() {
    this.el.node().removeEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.el.node().removeEventListener("mouseleave", this.onMouseLeave.bind(this));
    this.el.node().removeEventListener("click", this.onClick.bind(this));
    this.chartContainer.remove();
  }

  // Helper method
  public elementFor(component: string): D3Selection {
    return this.elMap[component];
  }
}

export default ProcessFlowCanvas;
