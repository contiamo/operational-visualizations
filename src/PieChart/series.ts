import { filter, forEach, LodashForEach } from "lodash/fp";
import Renderer from "./renderers/renderer";

import {
  D3Selection,
  EventEmitter,
  InputData,
  InputDatum,
  Renderer as RendererInterface,
  RendererOptions,
  State,
  StateWriter,
  WithConvert,
} from "./typings";

class Series {
  private attributes: any;
  private data!: InputData;
  private el: D3Selection;
  private events: EventEmitter;
  private renderAs!: () => RendererOptions[];
  private renderer!: RendererInterface;
  private state: State;
  private stateWriter: StateWriter;

  constructor(state: State, stateWriter: StateWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.stateWriter = stateWriter;
    this.events = events;
    this.el = el;
  }

  public assignData() {
    this.attributes = this.state.current.getData();
    this.assignAccessors();
    this.updateRenderer();
    this.prepareData();
    this.stateWriter("dataForLegend", this.renderer.dataForLegend());
  }

  private prepareData() {
    this.data = filter(
      (datum: InputDatum): boolean =>
        !!this.renderer.key(datum) && this.renderer.key(datum).length > 0 && this.renderer.value(datum) > 0,
    )(this.state.current.getAccessors().data.data(this.attributes));
    this.renderer.setData(this.data);
    this.stateWriter("data", this.data);
  }

  private assignAccessors() {
    const accessors = this.state.current.getAccessors().series;
    (forEach as WithConvert<LodashForEach>).convert({ cap: false })((accessor: any, key: string) => {
      (this as any)[key] = () => accessor(this.attributes);
    })(accessors);
  }

  private updateRenderer() {
    const options = this.renderAs();
    if (!options || options.length !== 1) {
      throw new Error(`Incorrect number of renderers: ${!options ? 0 : options.length} specified, 1 required`);
    }
    const rendererOptions = options[0];
    if (!this.renderer) {
      this.renderer = this.createRenderer(rendererOptions);
    } else if (this.renderer.type !== rendererOptions.type) {
      this.renderer.remove();
      this.renderer = this.createRenderer(rendererOptions);
    } else {
      this.renderer.updateOptions(rendererOptions);
    }
  }

  private createRenderer(options: RendererOptions): any {
    return new Renderer(this.state, this.events, this.el.select("g.drawing"), options);
  }

  public draw() {
    this.renderer.draw();
  }
}

export default Series;
