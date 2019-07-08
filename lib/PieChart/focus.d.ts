import { ComputedWriter, D3Selection, EventEmitter, Focus, State } from "./typings";
declare class PieChartFocus implements Focus {
    private el;
    private componentFocus;
    private state;
    private events;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, els: {
        [key: string]: D3Selection;
    });
    private onElementHover;
    private onElementOut;
    private onMouseLeave;
    remove(): void;
}
export default PieChartFocus;
//# sourceMappingURL=focus.d.ts.map