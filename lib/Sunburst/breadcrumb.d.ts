import { ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class Breadcrumb {
    private el;
    private events;
    private state;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    private updateHoverPath;
    private label;
    private truncateNodeArray;
    private backgroundColor;
    private labelColor;
    private update;
    private onClick;
}
export default Breadcrumb;
//# sourceMappingURL=breadcrumb.d.ts.map