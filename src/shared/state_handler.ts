import State, { ReadOnlyState, Path } from "./state"
import { Accessor, Accessors, ChartStateObject } from "./typings"
import { forEach, get, isEmpty, reduce } from "lodash/fp"

export interface ChartState<Data, Config, AccessorsObject, Computed> {
  current: State<Data, Config, AccessorsObject, Computed>
  previous: State<Data, Config, AccessorsObject, Computed>
}

export interface ChartStateReadOnly<Data, Config, AccessorsObject, Computed> {
  current: ReadOnlyState<Data, Config, AccessorsObject, Computed>
  previous: ReadOnlyState<Data, Config, AccessorsObject, Computed>
}

export type StateWriter = (propertyPath: string | string[], value: any) => void

export default class StateHandler<Data, Config, AccessorsObject, Computed> {
  state: ChartState<Data, Config, AccessorsObject, Computed>

  constructor(obj: ChartStateObject<Data, Config, AccessorsObject, Computed>) {
    const initial = new State<Data, Config, AccessorsObject, Computed>(obj)
    this.state = { current: initial, previous: initial.clone() }
  }

  captureState() {
    this.state.previous.set("computed", this.state.current.getComputed())
  }

  readOnly() {
    return {
      current: this.state.current.readOnly(),
      previous: this.state.previous.readOnly(),
    }
  }

  // Data
  data(data?: Data) {
    if (!arguments.length) return this.state.current.getData()
    return this.state.current.set("data", data)
  }

  hasData(): boolean {
    return isEmpty(this.data())
  }

  // Config
  config(config?: Partial<Config>) {
    if (!arguments.length) return this.state.current.getConfig()

    const invalidOptions: string[] = reduce.convert({ cap: false })(
      (memo: string[], value: any, key: string): string[] => {
        if (!value && value !== false) {
          memo.push(key)
        }
        return memo
      },
      [],
    )(config)
    forEach(
      (option: string): void => {
        console.warn(`Warning: invalid config option '${option}: reverting to default.`)
      },
    )(invalidOptions)

    return this.state.current.merge("config", config)
  }

  // Accessors
  accessors(type: string, accessors?: Accessors<any>) {
    if (!accessors) return get("type")(this.state.current.getAccessors())
    const accessorFuncs: Accessors<any> = reduce.convert({ cap: false })(
      (memo: Accessors<any>, accessor: Accessor<any, any>, key: string) => {
        memo[key] = typeof accessor === "function" ? accessor : () => accessor
        return memo
      },
      {},
    )(accessors)
    return this.state.current.merge(["accessors", type], accessorFuncs)
  }

  // Computed
  computedWriter(namespace: Path): StateWriter {
    return (path: Path, value: any): void => {
      this.state.current.set(["computed"].concat(namespace).concat(path), value)
    }
  }
}
