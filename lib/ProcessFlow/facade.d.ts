import { Accessors, Facade, InputData, ProcessFlowConfig } from "./typings";
declare class ProcessFlowFacade implements Facade {
    private DISPOSED;
    private canvas;
    private context;
    private events;
    private seriesManager;
    private state;
    constructor(context: Element);
    private initializeEvents;
    private initializeState;
    private initializeCanvas;
    private initializeComponents;
    private initializeSeries;
    data<T>(data?: T): InputData;
    config(config?: Partial<ProcessFlowConfig>): ProcessFlowConfig;
    accessors(type: string, accessors: Accessors<any>): Accessors<any>;
    on(event: string, handler: (e: any) => void): void;
    off(event: string, handler: (e: any) => void): void;
    draw(): void;
    close(): void;
}
export default ProcessFlowFacade;
//# sourceMappingURL=facade.d.ts.map