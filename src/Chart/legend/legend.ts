import * as d3 from "d3-selection";
import { get } from "lodash/fp";
import Events from "../../shared/event_catalog";
import * as styles from "../../shared/styles";
import { StateWriter } from "../../shared/typings";
import { withD3Element } from "../../utils/d3_utils";

import {
  ComponentConfigInfo,
  ComponentHoverPayload,
  D3Selection,
  EventBus,
  Legend,
  LegendDatum,
  State,
} from "../typings";

class ChartLegend implements Legend {
  private data!: LegendDatum[];
  private events: EventBus;
  private state: State;
  public el: D3Selection;

  constructor(state: State, _: StateWriter, events: EventBus, el: D3Selection) {
    this.state = state;
    this.events = events;
    this.el = el;
  }

  public setData(data: LegendDatum[]) {
    this.data = data;
  }

  public draw() {
    // No legend
    if (!this.state.current.getConfig().legend || !this.data) {
      this.remove();
      return;
    }

    this.el.style("display", "initial");
    const legends: D3Selection = this.el.selectAll(`div.${styles.seriesLegend}`).data(this.data, get("label"));

    legends.exit().remove();

    legends
      .enter()
      .append("div")
      .attr("class", styles.seriesLegend)
      .style("float", "left")
      .on("mouseenter", withD3Element(this.onComponentHover.bind(this)))
      .each(
        withD3Element((_: LegendDatum, el: HTMLElement) => {
          const element = d3.select(el);
          element.append("div").attr("class", "color");
          element.append("div").attr("class", "name");
        }),
      )
      .merge(legends)
      .each(
        withD3Element((_: LegendDatum, el: HTMLElement) => {
          const element = d3.select(el);
          element.select("div.color").style("background-color", get("color"));
          element.select("div.name").html(get("label"));
        }),
      );
  }

  public setWidth(width: number) {
    this.el.style("width", width);
  }

  public remove() {
    this.el.node().innerHTML = "";
    this.el.style("display", "none");
  }

  private onComponentHover(d: LegendDatum, el: HTMLElement) {
    const payload: ComponentHoverPayload = { component: d3.select(el), options: this.currentOptions(d) };
    this.events.emit(Events.FOCUS.COMPONENT.HOVER, payload);
  }

  private currentOptions(datum: LegendDatum): ComponentConfigInfo {
    return {
      key: datum.key,
      type: "series",
    };
  }
}

export default ChartLegend;
