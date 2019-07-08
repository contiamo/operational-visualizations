import { ChartStateObject } from "./typings";
export declare type Path = string | string[];
export interface ReadOnlyState<Data, Config, AccessorsObject, Computed> {
    getData: () => Readonly<Data>;
    getConfig: () => Readonly<Config>;
    getAccessors: () => Readonly<AccessorsObject>;
    getComputed: () => Readonly<Computed>;
}
export default class State<Data, Config, AccessorsObject, Computed> {
    private state;
    constructor(obj: ChartStateObject<Data, Config, AccessorsObject, Computed>);
    getData(): Data;
    getConfig(): Config;
    getAccessors(): AccessorsObject;
    getComputed(): Computed;
    set<T>(path: Path, value: T): T;
    merge(path: Path, value?: Record<string, any>): any;
    readOnly(): ReadOnlyState<Data, Config, AccessorsObject, Computed>;
    clone(): State<Data, Config, AccessorsObject, Computed>;
    private mergePath;
}
//# sourceMappingURL=state.d.ts.map