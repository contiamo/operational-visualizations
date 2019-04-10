import { D3Selection, EventEmitter, RendererOptions, State } from "../typings";
import Donut from "./donut";
import Gauge from "./gauge";
import Polar from "./polar";

// Factory Class
export default function rendererFactory(state: State, events: EventEmitter, el: D3Selection, options: RendererOptions) {
  switch (options.type) {
    case "donut":
      return new Donut(state, events, el, options);
    case "polar":
      return new Polar(state, events, el, options);
    case "gauge":
      return new Gauge(state, events, el, options);
    default:
      throw new Error(`invalid render type '${options.type}' specified`);
  }
}
