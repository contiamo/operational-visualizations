import { Accessors, Data, Facade, SunburstConfig } from "./typings";
declare class SunburstFacade implements Facade {
    private DISPOSED;
    private canvas;
    private components;
    private context;
    private customColorAccessor;
    private events;
    private state;
    constructor(context: Element);
    private initializeEvents;
    private initializeState;
    private initializeCanvas;
    private initializeComponents;
    data(data?: Data): Data;
    config(config?: Partial<SunburstConfig>): SunburstConfig;
    accessors(type: string, accessors: Accessors<any>): Accessors<any>;
    on(event: string, handler: any): void;
    off(event: string, handler: any): void;
    draw(): void;
    close(): void;
}
export default SunburstFacade;
//# sourceMappingURL=facade.d.ts.map