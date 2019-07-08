import { ChartStateReadOnly, D3Selection, EventEmitter } from "./typings";
declare class ComponentFocus {
    private el;
    private events;
    private state;
    constructor(state: ChartStateReadOnly<any, any, any, any>, el: D3Selection, events: EventEmitter);
    private onComponentHover;
    private draw;
    private onMouseOut;
    private onClick;
    remove(): void;
}
export default ComponentFocus;
//# sourceMappingURL=component_focus.d.ts.map