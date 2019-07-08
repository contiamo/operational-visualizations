import { ComputedWriter, Data, State } from "./typings";
declare class DataHandler {
    private journeys;
    private nodes;
    private links;
    private state;
    private computedWriter;
    private layout;
    constructor(state: State, computedWriter: ComputedWriter);
    prepareData(): Data;
    private initializeNodes;
    private findNode;
    private addNode;
    private calculateNodeSizes;
    private calculateStartsAndEnds;
    private initializeLinks;
    private findLink;
    private addLink;
    private computeLinks;
    private xGridSpacing;
    private yGridSpacing;
    private positionNodes;
}
export default DataHandler;
//# sourceMappingURL=data_handler.d.ts.map