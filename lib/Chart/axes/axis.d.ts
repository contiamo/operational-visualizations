import { ComputedWriter, D3Selection, EventEmitter } from "../../shared/typings";
import { AxisComputed, AxisOptions, AxisPosition, AxisType, ComputedAxisInput, FullAxisOptions, State } from "../typings";
declare class Axis {
    private computed;
    preComputed: AxisComputed | false;
    private el;
    private events;
    isXAxis: boolean;
    options: FullAxisOptions;
    position: AxisPosition;
    private state;
    private computedWriter;
    private ticks;
    type: AxisType;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection, position: AxisPosition);
    private insertAxis;
    /** Update the axis options */
    update(options: AxisOptions | ComputedAxisInput): void;
    /** Check if options already contain  */
    /** Trigger axis draw/transition with new computed values */
    draw(computed: AxisComputed, duration?: number): void;
    /** Calculates the amount of space required by the axis, and positions the axis accordingly */
    adjustMargins(): void;
    /** Removes axis */
    close(): void;
    /** Moves axis to correct position in canvas */
    private translateAxis;
    /** Renders tick lines */
    private drawTicks;
    private getTickAttributes;
    /** Renders tick labels */
    private drawLabels;
    private getAttributes;
    private getStartAttributes;
    /** Renders axis border line */
    private drawBorder;
    private computeRequiredMargin;
    /** Positions and sizes the axis background rect to ensure proper hovering behaviour */
    private positionBackgroundRect;
    /** Adds/updates/removes the axis title */
    private drawTitle;
    private getTitleAttributes;
    private onComponentHover;
    private hoverInfo;
}
export default Axis;
//# sourceMappingURL=axis.d.ts.map