import { ComputedWriter, D3Selection, EventEmitter, Focus, State } from "./typings";
declare class ChartFocus implements Focus {
    private componentFocus;
    private dateFocus;
    private elementFocus;
    private flagFocus;
    private state;
    private events;
    constructor(state: State, _: ComputedWriter, events: EventEmitter, els: {
        [key: string]: D3Selection;
    });
    remove(): void;
}
export default ChartFocus;
//# sourceMappingURL=focus.d.ts.map