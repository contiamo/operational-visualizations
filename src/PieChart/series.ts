import { filter, forEach } from "lodash/fp";
import rendererFactory from "./renderers/rendererFactory";

import { WithConvertLodashForEach } from "../shared/typings";

import {
  ComputedWriter,
  D3Selection,
  Data,
  EventEmitter,
  InputData,
  InputDatum,
  Renderer as RendererInterface,
  RendererOptions,
  SeriesAccessors,
  State,
} from "./typings";

class Series {
  private el: D3Selection;
  private events: EventEmitter;
  private state: State;
  private computedWriter: ComputedWriter;

  private renderer!: RendererInterface;
  private attributes!: Data;
  private data!: InputData;
  private renderAs!: () => RendererOptions[];
  // @ts-ignore required to pass typecheck of assignAccessors, but not used
  private name!: () => string;

  constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.computedWriter = computedWriter;
    this.events = events;
    this.el = el;
  }

  public assignData() {
    this.attributes = this.state.current.getData();
    this.assignAccessors();
    this.updateRenderer();
    this.prepareData();
    this.computedWriter("dataForLegend", this.renderer.dataForLegend());
  }

  private prepareData() {
    this.data = filter(
      (datum: InputDatum): boolean =>
        !!this.renderer.key(datum) && this.renderer.key(datum).length > 0 && this.renderer.value(datum) > 0,
    )(this.state.current.getAccessors().data.data(this.attributes));
    this.renderer.setData(this.data);
    this.computedWriter("data", this.data);
  }

  private assignAccessors() {
    (forEach as WithConvertLodashForEach).convert<SeriesAccessors>({ cap: false })((accessor, key) => {
      // this doesn't type check, this.attributes has wrong type
      this[key] = () => accessor(this.attributes as any);
    })(this.state.current.getAccessors().series);
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

  private createRenderer(options: RendererOptions) {
    return rendererFactory(this.state, this.events, this.el.select("g.drawing"), options);
  }

  public draw() {
    this.renderer.draw();
  }
}

export default Series;
