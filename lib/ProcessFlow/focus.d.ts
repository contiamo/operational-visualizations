import { ComputedWriter, D3Selection, EventEmitter, Focus, State } from "./typings";
declare class ProcessFlowFocus implements Focus {
    private el;
    private state;
    private events;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    private onElementHover;
    private appendContent;
    private addNodeBreakdowns;
    private addSingleNodeVisitsComment;
    private getDrawingDimensions;
    private onElementOut;
    private onMouseLeave;
    remove(): void;
}
export default ProcessFlowFocus;
//# sourceMappingURL=focus.d.ts.map