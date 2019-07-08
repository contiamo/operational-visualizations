import { ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class Series {
    private el;
    private events;
    private state;
    private computedWriter;
    private renderer;
    private attributes;
    private data;
    private renderAs;
    private name;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection);
    assignData(): void;
    private prepareData;
    private assignAccessors;
    private updateRenderer;
    private createRenderer;
    draw(): void;
}
export default Series;
//# sourceMappingURL=series.d.ts.map