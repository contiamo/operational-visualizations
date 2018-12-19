import { cloneDeep, defaults, set } from "lodash/fp";
import { ChartStateObject } from "./typings";

export type Path = string | string[];

/*
 ** All visualizations have a common state structure with the following 4 properties:
 ** data, config, accessors and computed.
 **/
export interface ReadOnlyState<Data, Config, AccessorsObject, Computed> {
  getData: () => Readonly<Data>;
  getConfig: () => Readonly<Config>;
  getAccessors: () => Readonly<AccessorsObject>;
  getComputed: () => Readonly<Computed>;
}

export default class State<Data, Config, AccessorsObject, Computed> {
  private state: ChartStateObject<Data, Config, AccessorsObject, Computed>;

  constructor(obj: ChartStateObject<Data, Config, AccessorsObject, Computed>) {
    this.state = cloneDeep(obj);
  }

  public getData() {
    return this.state.data;
  }

  public getConfig() {
    return this.state.config;
  }

  public getAccessors() {
    return this.state.accessors;
  }

  /*
   ** this.state.computed is generally a heavily nested object. TS Readonly<T> does not currently
   ** support nesting. The deep clone protects against unintended changes to the computed object,
   ** but a TS error will only be thrown if first-level properties of the computed object are modified.
   */
  public getComputed() {
    return cloneDeep(this.state.computed);
  }

  public set(path: Path, value: any) {
    this.state = set(path)(value)(this.state);
    return value;
  }

  public merge(path: Path, value: Record<string, any> = {}) {
    return this.mergePath(([] as string[]).concat(path), value);
  }

  public readOnly(): ReadOnlyState<Data, Config, AccessorsObject, Computed> {
    return {
      getData: this.getData.bind(this),
      getConfig: this.getConfig.bind(this),
      getAccessors: this.getAccessors.bind(this),
      getComputed: this.getComputed.bind(this),
    };
  }

  public clone(): State<Data, Config, AccessorsObject, Computed> {
    // State object will be deep-cloned in constructor
    return new State<Data, Config, AccessorsObject, Computed>(this.state);
  }

  private mergePath(path: string[], value: Record<string, any>) {
    return path.reduce((currentStateChunk: any, currentPath: string, index: number) => {
      if (currentStateChunk !== null && typeof currentStateChunk === "object") {
        if (index === path.length - 1) {
          currentStateChunk[currentPath] = defaults(currentStateChunk[currentPath])(value);
        }
        return currentStateChunk[currentPath];
      }
      throw new Error(`Path [${path.join(", ")}] not found in object`);
    }, this.state);
  }
}
