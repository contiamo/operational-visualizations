import { Canvas, ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class ProcessFlowCanvas implements Canvas {
    private chartContainer;
    private el;
    private events;
    private state;
    private elMap;
    private computedWriter;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, context: Element);
    private renderChartContainer;
    private renderEl;
    private onMouseEnter;
    private onMouseLeave;
    private onClick;
    private renderFocus;
    private renderDrawingGroups;
    draw(): void;
    remove(): void;
    elementFor(component: string): D3Selection;
}
export default ProcessFlowCanvas;
//# sourceMappingURL=canvas.d.ts.map