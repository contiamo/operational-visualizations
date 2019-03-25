import { defaults, keys } from "lodash/fp";
import * as React from "react";
import { Accessors } from "../shared/typings";
import theme from "./constants";

export interface Props {
  style?: {};
  className?: string;
  facade: any;
  accessors?: Record<string, Accessors<any>>;
  data?: any;
  config?: any;
}

class VisualizationWrapper extends React.Component<Props, {}> {
  private containerNode!: HTMLDivElement;
  private viz!: any;
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
    this.viz.data(this.props.data || {});
    const accessors = this.props.accessors;
    if (accessors) {
      keys(accessors).forEach((key: string) => {
        this.viz.accessors(key, accessors[key]);
      });
    }
    this.viz.config(defaults({ palette: theme.palettes.qualitative.generic })(this.props.config || {}));
  }

  public componentWillUnmount() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.viz.close();
  }
}

export default VisualizationWrapper;
