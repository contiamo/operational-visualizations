import { defaults, keys } from "lodash/fp";
import * as React from "react";
import { Accessors, Class, Facade } from "../shared/typings";
import theme from "./constants";

export interface Props<Config = any, Data = any> {
  style?: React.CSSProperties;
  className?: string;
  facade: Class<Facade<Config, Data>>;
  accessors?: Record<string, Accessors<any>>;
  data?: Data;
  config?: Config;
}

class VisualizationWrapper<
  Config extends Record<string, any> = Record<string, any>,
  Data = any
> extends React.Component<Props<Config, Data>, {}> {
  private containerNode!: HTMLDivElement;
  private viz!: Facade<Config, Data>;
  private timerId: number | null = null;

  public render() {
    return (
      <>
        <div
          style={this.props.style}
          className={`${this.props.className ? `${this.props.className} ` : ""}Visualization`}
          ref={(containerNode: HTMLDivElement) => (this.containerNode = containerNode)}
        />
      </>
    );
  }

  public componentDidMount() {
    this.viz = new this.props.facade(this.containerNode);
    this.timerId = window.setTimeout(() => {
      this.updateViz();
      this.viz.draw();
    }, 0);
  }

  public componentDidUpdate() {
    this.timerId = window.setTimeout(() => {
      this.updateViz();
      this.viz.draw();
    }, 0);
  }

  public updateViz() {
    this.viz.data(this.props.data || ({} as Data));
    const accessors = this.props.accessors;
    if (accessors) {
      keys(accessors).forEach((key: string) => {
        this.viz.accessors(key, accessors[key]);
      });
    }
    this.viz.config(defaults({ palette: theme.palettes.qualitative.generic } as any)(this.props.config || {}));
  }

  public componentWillUnmount() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.viz.close();
  }
}

export default VisualizationWrapper;
