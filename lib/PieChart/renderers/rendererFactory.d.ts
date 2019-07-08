import { D3Selection, EventEmitter, RendererOptions, State } from "../typings";
import Donut from "./donut";
import Gauge from "./gauge";
import Polar from "./polar";
export default function rendererFactory(state: State, events: EventEmitter, el: D3Selection, options: RendererOptions): Donut | Polar | Gauge;
//# sourceMappingURL=rendererFactory.d.ts.map