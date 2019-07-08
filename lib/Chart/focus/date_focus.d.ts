import { D3Selection, EventEmitter, State } from "../typings";
declare class DateFocus {
    private el;
    private els;
    private elGroup;
    private events;
    private state;
    constructor(state: State, els: {
        [key: string]: D3Selection;
    }, events: EventEmitter);
    private onMouseMove;
    private clampDate;
    private focusDate;
    private focus;
    private drawLine;
    private drawPoints;
    private drawLabel;
    private drawItemsForAxis;
    private getDrawingPosition;
    private addTitle;
    private addSeriesItems;
    private addSeriesItem;
    remove(): void;
}
export default DateFocus;
//# sourceMappingURL=date_focus.d.ts.map