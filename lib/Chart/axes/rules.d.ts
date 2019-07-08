import { AxisOrientation } from "../../axis_utils/typings";
import { D3Selection, State } from "../typings";
declare class Rules {
    private el;
    private orientation;
    private state;
    private yRules;
    constructor(state: State, el: D3Selection, orientation: AxisOrientation);
    draw(): void;
    private attributes;
    close(): void;
}
export default Rules;
//# sourceMappingURL=rules.d.ts.map