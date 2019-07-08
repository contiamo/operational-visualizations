import { ComputedWriter } from "../../shared/typings";
import { D3Selection, EventEmitter, Legend, LegendDatum, State } from "../typings";
declare class ChartLegend implements Legend {
    private data;
    private events;
    private state;
    el: D3Selection;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    setData(data: LegendDatum[]): void;
    draw(): void;
    setWidth(width: number): void;
    remove(): void;
    private onComponentHover;
    private currentOptions;
}
export default ChartLegend;
//# sourceMappingURL=legend.d.ts.map