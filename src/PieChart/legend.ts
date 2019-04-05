import * as d3 from "d3-selection";
import { filter, get } from "lodash/fp";
import Events from "../shared/event_catalog";
import * as globalStyles from "../shared/styles";
import { withD3Element } from "../utils/d3_utils";
import * as localStyles from "./styles";

import {
  ComponentConfigInfo,
  ComponentHoverPayload,
  ComputedWriter,
  D3Selection,
  EventEmitter,
  Legend,
  LegendDatum,
  State,
} from "./typings";

class PieChartLegend implements Legend {
  private events: EventEmitter;
  private legend: D3Selection;
  private state: State;

  constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.events = events;
    this.legend = el;
  }

  public draw() {
    // No legend
    if (!this.state.current.getConfig().legend) {
      this.remove();
      return;
    }

    const legends: D3Selection = this.legend
      .selectAll(`div.${globalStyles.seriesLegend}`)
      .data(this.data(), get("label"));

    legends.exit().remove();

    legends
      .enter()
      .append("div")
      .attr("class", globalStyles.seriesLegend)
      .style("float", "left")
      .on("mouseenter", withD3Element(this.onComponentHover.bind(this)))
      .each(
        withD3Element((_: LegendDatum, el: HTMLElement) => {
          const element: D3Selection = d3.select(el);
          element.append("div").attr("class", "color");
          element.append("div").attr("class", "name");
        }),
      )
      .merge(legends)
      .each(
        withD3Element((_: LegendDatum, el: HTMLElement) => {
          const element: D3Selection = d3.select(el);
          element.select("div.color").style("background-color", get("color"));
          element.select("div.name").html(get("label"));
        }),
      );

    this.updateComparisonLegend();
  }

  private updateComparisonLegend() {
    // Only needed for gauges, if comparison value is given.
    const data = filter((d: LegendDatum) => !!d.comparison)(this.state.current.getComputed().series.dataForLegend);

    const legends: D3Selection = this.legend.selectAll(`div.comparison`).data(data);

    legends.exit().remove();

    const enter = legends
      .enter()
      .append("div")
      .attr("class", `comparison ${localStyles.comparisonLegend}`)
      .on("mouseenter", withD3Element(this.onComponentHover.bind(this)));

    enter.append("div").attr("class", localStyles.comparisonLegendLine);

    enter.append("div").attr("class", "name");

    enter
      .merge(legends)
      .select("div.name")
      .html((d: LegendDatum) => d.label);
  }

  private data() {
    return filter((d: LegendDatum) => !d.comparison)(this.state.current.getComputed().series.dataForLegend);
  }

  private onComponentHover(d: LegendDatum, el: HTMLElement) {
    const payload: ComponentHoverPayload = { component: d3.select(el), options: this.currentOptions(d) };
    this.events.emit(Events.FOCUS.COMPONENT.HOVER, payload);
  }

  private currentOptions(datum: LegendDatum): ComponentConfigInfo {
    return datum.comparison
      ? {
          key: datum.label,
          seriesType: "comparison",
          type: "series",
        }
      : {
          key: datum.label,
          type: "series",
        };
  }

  public remove() {
    this.legend.node().innerHTML = "";
  }
}

export default PieChartLegend;
