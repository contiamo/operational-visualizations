import { Canvas, ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class PieChartCanvas implements Canvas {
    private drawingContainer;
    private elements;
    private chartContainer;
    private el;
    private events;
    private state;
    private elMap;
    private computedWriter;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, context: Element);
    private renderChartContainer;
    private onMouseEnter;
    private onMouseLeave;
    private onClick;
    private renderLegend;
    private renderDrawingContainer;
    private renderEl;
    private renderDrawingGroup;
    private renderFocusElements;
    private renderFocusLabel;
    private renderComponentFocus;
    private drawingContainerDims;
    draw(): void;
    remove(): void;
    elementFor(component: string): D3Selection;
}
export default PieChartCanvas;
//# sourceMappingURL=canvas.d.ts.map