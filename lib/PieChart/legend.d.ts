import { ComputedWriter, D3Selection, EventEmitter, Legend, State } from "./typings";
declare class PieChartLegend implements Legend {
    private events;
    private legend;
    private state;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    draw(): void;
    private updateComparisonLegend;
    private data;
    private onComponentHover;
    private currentOptions;
    remove(): void;
}
export default PieChartLegend;
//# sourceMappingURL=legend.d.ts.map