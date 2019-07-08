import { ComputedWriter, D3Selection, EventEmitter, Focus, State } from "./typings";
declare class SunburstFocus implements Focus {
    private el;
    private state;
    private events;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, el: D3Selection);
    private onElementHover;
    private percentageString;
    private singlePercentageString;
    private onElementOut;
    private onMouseLeave;
    remove(): void;
}
export default SunburstFocus;
//# sourceMappingURL=focus.d.ts.map