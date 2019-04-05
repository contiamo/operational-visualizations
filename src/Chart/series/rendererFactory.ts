import { D3Selection, Datum, EventEmitter, SingleRendererOptions, State } from "../typings";
import Area from "./renderers/area";
import Bars from "./renderers/bars";
import Flag from "./renderers/flag";
import Line from "./renderers/line";
import Symbol from "./renderers/symbol";
import Text from "./renderers/text";
import ChartSeries from "./series";

export default function rendererFactory(
  state: State,
  events: EventEmitter,
  el: D3Selection,
  data: Datum[],
  options: SingleRendererOptions,
  series: ChartSeries,
) {
  switch (options.type) {
    case "area":
      return new Area(state, el.select("g.series-area"), data, options, series);
    case "bars":
      return new Bars(state, el.select("g.series-bars"), data, options, series, events);
    case "flag":
      return new Flag(state, el.select("g.series-flag"), data, options, series, events);
    case "line":
      return new Line(state, el.select("g.series-line"), data, options, series);
    case "symbol":
      return new Symbol(state, el.select("g.series-symbol"), data, options, series, events);
    case "text":
      return new Text(state, el.select("g.series-text"), data, options, series);
    default:
      throw new Error(`No "${(options as any).type}" renderer is available.`);
  }
}
