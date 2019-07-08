import "d3-transition";
import { D3Selection, EventEmitter, NodeFocusElement, Renderer, State, TNode } from "../typings";
declare class Nodes implements Renderer<TNode, NodeFocusElement> {
    private config;
    private data;
    private el;
    private events;
    private state;
    constructor(state: State, events: EventEmitter, el: D3Selection);
    private onMouseOver;
    private mouseOver;
    focusElement(focusElement: NodeFocusElement): void;
    highlight(element: D3Selection, _: TNode, keepCurrent?: boolean): void;
    private removeHighlights;
    private focusPoint;
    private onMouseOut;
    draw(data: TNode[]): void;
    private borderScale;
    private translate;
    private rotate;
    private enterAndUpdate;
    private getNodeBoundingRect;
    private getLabelPosition;
    private getAutomaticLabelPosition;
    private getNodeLabelX;
    private getNodeLabelY;
    private getLabelText;
    private updateNodeLabels;
}
export default Nodes;
//# sourceMappingURL=nodes.d.ts.map