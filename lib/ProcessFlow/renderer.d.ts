import { D3Selection, Data, EventEmitter, State } from "./typings";
declare class Renderer {
    private links;
    private nodes;
    private el;
    private events;
    constructor(state: State, events: EventEmitter, el: D3Selection);
    draw(data: Data): void;
    private focusElement;
    private highlightPath;
    close(): void;
}
export default Renderer;
//# sourceMappingURL=renderer.d.ts.map