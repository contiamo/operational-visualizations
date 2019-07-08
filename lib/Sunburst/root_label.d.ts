import { ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class RootLabel {
    private el;
    private events;
    private state;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    private update;
}
export default RootLabel;
//# sourceMappingURL=root_label.d.ts.map