import DataHandler from "./data_handler";
import Renderer from "./renderer";
import { ComputedWriter, D3Selection, Data, EventEmitter, State } from "./typings";

class Series {
  private data!: Data;
  private dataHandler: DataHandler;
  private el: D3Selection;
  private renderer: Renderer;
  private state: State;
  private computedWriter: ComputedWriter;

  constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection) {
    this.state = state;
    this.computedWriter = computedWriter;
    this.el = el;
    this.dataHandler = new DataHandler(state, computedWriter);
    this.renderer = new Renderer(state, events, el);
  }

  public prepareData() {
    this.data = this.dataHandler.prepareData();
    this.computedWriter("data", this.data);
  }

  public draw() {
    const seriesConfig = this.state.current.getComputed().series;
    this.el.attr("width", seriesConfig.width).attr("height", seriesConfig.height);
    this.renderer.draw(this.data);
  }
}

export default Series;
