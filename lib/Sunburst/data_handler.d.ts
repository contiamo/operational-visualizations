import { ComputedWriter, HierarchyDatum, ProcessedData, State } from "./typings";
declare class DataHandler {
    private color;
    private data;
    private id;
    private name;
    private state;
    private computedWriter;
    private value;
    topNode: HierarchyDatum;
    constructor(state: State, computedWriter: ComputedWriter);
    private assignAccessors;
    prepareData(): import("d3-hierarchy").HierarchyRectangularNode<ProcessedData>[];
    private assignColors;
    private assignNames;
    private assignIDs;
    private assignZoomable;
    private assignValues;
    private checkDataValidity;
}
export default DataHandler;
//# sourceMappingURL=data_handler.d.ts.map