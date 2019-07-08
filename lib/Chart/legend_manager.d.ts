import { ComputedWriter, D3Selection, EventEmitter, State } from "./typings";
declare class LegendManager {
    private legends;
    private state;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, els: {
        [key: string]: {
            [key: string]: D3Selection;
        };
    });
    draw(): void;
    remove(): void;
    private arrangeTopLegends;
    private calculateMaxWidth;
}
export default LegendManager;
//# sourceMappingURL=legend_manager.d.ts.map