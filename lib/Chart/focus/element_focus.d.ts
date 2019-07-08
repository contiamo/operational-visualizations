import { D3Selection, EventEmitter, State } from "../typings";
declare class ElementFocus {
    private el;
    private els;
    private events;
    private state;
    constructor(state: State, els: {
        [key: string]: D3Selection;
    }, events: EventEmitter);
    private onMouseOver;
    private renderFocusLabel;
    private getDrawingPosition;
    remove(): void;
}
export default ElementFocus;
//# sourceMappingURL=element_focus.d.ts.map