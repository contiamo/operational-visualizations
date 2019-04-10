import * as d3 from "d3-selection";
import Events from "../shared/event_catalog";
import * as styles from "../shared/styles";
import { Canvas, ComputedWriter, D3Selection, Dimensions, EventEmitter, State } from "./typings";

class PieChartCanvas implements Canvas {
  private drawingContainer: D3Selection;
  private elements: { [key: string]: D3Selection } = {};
  private chartContainer: D3Selection;
  private el: D3Selection;
  private events: EventEmitter;
  private state: State;
  private elMap: { [key: string]: D3Selection } = {};
  private computedWriter: ComputedWriter;

  constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, context: Element) {
    this.state = state;
    this.computedWriter = computedWriter;
    this.events = events;
    this.chartContainer = this.renderChartContainer(context);
    this.renderLegend();
    this.drawingContainer = this.renderDrawingContainer();
    this.el = this.renderEl();
    this.renderDrawingGroup();
    this.renderFocusElements();
    this.computedWriter("elements", this.elements);
  }

  // Chart container
  private renderChartContainer(context: Element): D3Selection {
    const container = document.createElementNS(d3.namespaces.xhtml, "div");
    context.appendChild(container);
    container.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    container.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    container.addEventListener("click", this.onClick.bind(this));
    return d3
      .select(container)
      .attr("class", styles.chartContainer)
      .style("background-color", this.state.current.getConfig().backgroundColor);
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

  // Legend
  private renderLegend() {
    const legendNode = document.createElementNS(d3.namespaces.xhtml, "div");
    this.chartContainer.node().appendChild(legendNode);

    const legend = d3
      .select(legendNode)
      .attr("class", `${styles.legend} left`)
      .style("float", "left");

    this.elMap.legend = legend;
    this.computedWriter("legend", legend);
  }

  // Drawing container
  private renderDrawingContainer(): D3Selection {
    const drawingContainer = document.createElementNS(d3.namespaces.xhtml, "div");
    this.chartContainer.node().appendChild(drawingContainer);
    return d3.select(drawingContainer).attr("class", styles.drawingContainer);
  }

  // El
  private renderEl(): D3Selection {
    const el = document.createElementNS(d3.namespaces.svg, "svg");
    this.drawingContainer.node().appendChild(el);
    this.elMap.series = d3.select(el);
    return this.elMap.series;
  }

  // Drawing group
  private renderDrawingGroup() {
    this.elements.drawing = this.el.append("svg:g").attr("class", "drawing");
  }

  // Focus elements
  private renderFocusElements() {
    this.elMap.focus = this.renderFocusLabel();
    this.elMap.componentFocus = this.renderComponentFocus();
  }

  private renderFocusLabel(): D3Selection {
    const focusEl = d3
      .select(document.createElementNS(d3.namespaces.xhtml, "div"))
      .attr("class", `${styles.focusLegend}`)
      .style("visibility", "hidden");
    this.chartContainer.node().appendChild(focusEl.node());
    return focusEl;
  }

  private renderComponentFocus(): D3Selection {
    const focusEl = d3.select(document.createElementNS(d3.namespaces.xhtml, "div")).attr("class", "component-focus");
    const ref = this.chartContainer.node();
    ref.insertBefore(focusEl.node(), ref.nextSibling);
    return focusEl;
  }

  private drawingContainerDims(): Dimensions {
    const config = this.state.current.getConfig();
    return {
      height: config.height - this.elMap.legend.node().offsetHeight,
      width: config.width,
    };
  }

  // Lifecycle
  public draw() {
    this.chartContainer.classed("hidden", this.state.current.getConfig().hidden);
    this.computedWriter(["containerRect"], this.chartContainer.node().getBoundingClientRect());

    const config = this.state.current.getConfig();
    const dims = this.drawingContainerDims();
    this.computedWriter("drawingContainerDims", dims);

    this.chartContainer.style("width", `${config.width}px`).style("height", `${config.height}px`);
    this.drawingContainer.style("width", `${dims.width}px`).style("height", `${dims.height}px`);
    this.el.style("width", `${dims.width}px`).style("height", `${dims.height}px`);
    this.computedWriter("drawingContainerRect", this.drawingContainer.node().getBoundingClientRect());
  }

  public remove() {
    this.chartContainer.node().removeEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.chartContainer.node().removeEventListener("mouseleave", this.onMouseLeave.bind(this));
    this.chartContainer.node().removeEventListener("click", this.onClick.bind(this));
    this.elements = {};
    this.chartContainer.remove();
    this.elements = {};
    this.drawingContainer.remove();
  }

  // Helper method
  public elementFor(component: string): D3Selection {
    return this.elMap[component];
  }
}

export default PieChartCanvas;
