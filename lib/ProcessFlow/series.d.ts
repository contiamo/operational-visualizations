import { ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class Series {
    private data;
    private dataHandler;
    private el;
    private renderer;
    private state;
    private computedWriter;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection);
    prepareData(): void;
    draw(): void;
}
export default Series;
//# sourceMappingURL=series.d.ts.map