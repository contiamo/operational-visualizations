import "d3-transition";
import { D3Selection, EventEmitter, LinkFocusElement, Renderer, State, TLink } from "../typings";
declare class Links implements Renderer<TLink, LinkFocusElement> {
    private config;
    private data;
    el: D3Selection;
    private events;
    private state;
    constructor(state: State, events: EventEmitter, el: D3Selection);
    private onMouseOver;
    private mouseOver;
    focusElement(focusElement: LinkFocusElement): void;
    highlight(_: D3Selection, d: TLink, keepCurrent?: boolean): void;
    private removeHighlights;
    private focusPoint;
    private onMouseOut;
    draw(data: TLink[]): void;
    private borderScale;
    private enterAndUpdate;
    private startPath;
}
export default Links;
//# sourceMappingURL=links.d.ts.map