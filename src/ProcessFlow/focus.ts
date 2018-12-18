import { flow, forEach, map, reduce, sortBy } from "lodash/fp";
import Events from "../shared/event_catalog";
import { drawHidden, labelDimensions, positionLabel } from "../utils/focus_utils";
import * as styles from "./styles";
import { D3Selection, EventBus, Focus, HoverPayload, State, StateWriter, TLink, TNode } from "./typings";

interface Breakdown {
  label?: string;
  size: number;
  percentage: number;
}

interface Breakdowns {
  inputs: Breakdown[];
  outputs: Breakdown[];
  startsHere: Breakdown[];
  endsHere: Breakdown[];
}

// There can only be an element focus in process flow diagrams
class ProcessFlowFocus implements Focus {
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
    // Remove the current focus label, if there is one
    this.remove();
    if (payload.hideLabel) {
      return;
    }

    // Check if focus labels should be displayed for the element type.
    const focusPoint = payload.focusPoint;
    const datum = payload.d;
    const isNode = focusPoint.type === "node";
    const config = this.state.current.getConfig();

    if (isNode ? !config.showNodeFocusLabels : !config.showLinkFocusLabels) {
      return;
    }

    // Render the focus label hidden initially to allow placement calculations
    drawHidden(this.el, "element").style("pointer-events", "none");

    const content = this.el.append("xhtml:ul");

    content
      .append("xhtml:li")
      .attr("class", styles.title)
      .text(datum.label())
      .append("span")
      .text(` (${this.state.current.getConfig().numberFormatter(datum.size())})`);

    // @TODO remove? Doesn't seem to be doing anything...
    if (datum.content().length > 0) {
      this.appendContent(content, datum.content());
    }

    if (isNode) {
      this.addNodeBreakdowns(content, datum as TNode);
      this.addSingleNodeVisitsComment(content, datum as TNode);
    }

    // Get label dimensions (has to be actually rendered in the page to do this) and position label
    const labelDims = labelDimensions(this.el);
    const drawingDimensions = this.getDrawingDimensions();
    const offset = focusPoint.offset + config.nodeBorderWidth;
    const labelPosition = this.state.current.getConfig().focusLabelPosition;

    positionLabel(this.el, focusPoint, labelDims, drawingDimensions, offset, labelPosition);
  }

  private appendContent(container: D3Selection, content: Array<Record<string, any>>) {
    const contentContainer: D3Selection = container.append("div").attr("class", styles.content);
    forEach((contentItem: { [key: string]: any }) => {
      contentContainer
        .append("xhtml:li")
        .attr("class", styles.title)
        .text(`${contentItem.key}: `)
        .append("span")
        .text(contentItem.value);
    })(content);
  }

  private addNodeBreakdowns(content: D3Selection, datum: TNode) {
    const breakdowns: Breakdowns = computeBreakdowns(datum),
      container: D3Selection = content.append("div").attr("class", styles.breakdownsContainer),
      inputsTotal: number = computeBreakdownTotal(breakdowns.inputs),
      outputsTotal: number = computeBreakdownTotal(breakdowns.outputs),
      startsHerePercentage: number = Math.round((datum.journeyStarts * 100) / outputsTotal),
      endsHerePercentage: number = Math.round((datum.journeyEnds * 100) / inputsTotal),
      startsHereString: string = !isNaN(startsHerePercentage) ? `${startsHerePercentage}% of all outputs` : " ",
      endsHereString: string = !isNaN(endsHerePercentage) ? `${endsHerePercentage}% of all inputs` : " ",
      numberFormatter: (x: number) => string = this.state.current.getConfig().numberFormatter;

    // Add "Starts here" breakdown
    flow(
      addBreakdownContainer,
      addBreakdownTitle("Starts here"),
      addBreakdownBars(breakdowns.startsHere, numberFormatter),
      addBreakdownComment(startsHereString),
    )(container);

    // Add "Ends here" breakdown
    flow(
      addBreakdownContainer,
      addBreakdownTitle("Ends here"),
      addBreakdownBars(breakdowns.endsHere, numberFormatter),
      addBreakdownComment(endsHereString),
    )(container);

    // Add inputs breakdown
    flow(
      addBreakdownContainer,
      addBreakdownTitle("Inputs", ` (${numberFormatter(inputsTotal)})`),
      addBreakdownBars(breakdowns.inputs, numberFormatter),
    )(container);

    // Add outputs breakdown
    flow(
      addBreakdownContainer,
      addBreakdownTitle("Outputs", ` (${numberFormatter(outputsTotal)})`),
      addBreakdownBars(breakdowns.outputs, numberFormatter),
    )(container);
  }

  private addSingleNodeVisitsComment(content: D3Selection, datum: TNode) {
    if (datum.singleNodeJourneys === 0) {
      return;
    }
    content
      .append("xhtml:li")
      .attr("class", styles.title)
      .text(`[!] ${datum.singleNodeJourneys} single node visits (not included in the above stats)`);
  }

  private getDrawingDimensions(): { xMax: number; xMin: number; yMax: number; yMin: number } {
    const drawingContainer = this.state.current.getComputed().canvas.elRect;
    const computedSeries = this.state.current.getComputed().series;

    return {
      xMax: drawingContainer.left + computedSeries.width,
      xMin: drawingContainer.left,
      yMax: drawingContainer.top + computedSeries.height,
      yMin: drawingContainer.top,
    };
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

// Helper functions
const computeBreakdowns = (node: TNode): Breakdowns => {
  const inputs: Breakdown[] = map(
    (link: TLink): Breakdown => {
      const size: number = link.size();
      return {
        size,
        label: link.source().label(),
        percentage: Math.round((size * 100) / node.size()),
      };
    },
  )(node.targetLinks);
  const outputs: Breakdown[] = map(
    (link: TLink): Breakdown => {
      const size: number = link.size();
      return {
        size,
        label: link.target().label(),
        percentage: Math.round((size * 100) / node.size()),
      };
    },
  )(node.sourceLinks);
  const startsHere: Breakdown[] = [
    {
      size: node.journeyStarts,
      percentage: Math.round((node.journeyStarts * 100) / node.size()),
    },
  ];

  const endsHere = [
    {
      size: node.journeyEnds,
      percentage: Math.round((node.journeyEnds * 100) / node.size()),
    },
  ];

  return { inputs, outputs, startsHere, endsHere };
};

const computeBreakdownTotal = (breakdowns: Breakdown[]): number =>
  reduce((sum: number, item: Breakdown) => {
    return sum + item.size;
  }, 0)(breakdowns);

const addBreakdownContainer = (content: D3Selection): D3Selection =>
  content.append("div").attr("class", styles.breakdownContainer);

const addBreakdownTitle = (title: string, subtitle: string = "") => (container: D3Selection) => {
  container
    .append("span")
    .attr("class", styles.title)
    .text(title)
    .append("span")
    .text(subtitle);
  return container;
};

const addBreakdownBars = (breakdownItems: Breakdown[], numberFormatter: (x: number) => string) => {
  const sortedItems = sortBy((item: Breakdown) => -item.size)(breakdownItems);
  return (container: D3Selection) => {
    forEach(appendBreakdown(container, numberFormatter))(sortedItems);
    return container;
  };
};

const appendBreakdown = (container: D3Selection, numberFormatter: (x: number) => string) => (item: Breakdown) => {
  const breakdown = container.append("div").attr("class", styles.breakdown);

  if (item.label) {
    breakdown
      .append("label")
      .attr("class", styles.breakdownLabel)
      .text(item.label);
  }

  const backgroundBar = breakdown.append("div").attr("class", styles.breakdownBackgroundBar);

  backgroundBar
    .append("div")
    .attr("class", styles.breakdownBar)
    .style("width", item.percentage + "%");

  backgroundBar
    .append("div")
    .attr("class", styles.breakdownText)
    .text(`${numberFormatter(item.size)} (${item.percentage}%)`);
};

const addBreakdownComment = (comment: string) => (container: D3Selection) => {
  container
    .append("label")
    .attr("class", styles.breakdownCommentLabel)
    .text(comment);
  return container;
};

export default ProcessFlowFocus;
