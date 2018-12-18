import DataHandler from "./data_handler";
import Renderer from "./renderer";
import { D3Selection, Data, EventBus, State, StateWriter } from "./typings";

class Series {
  private data!: Data;
  private dataHandler: DataHandler;
  private el: D3Selection;
  private renderer: Renderer;
  private state: State;
  private stateWriter: StateWriter;

  constructor(state: State, stateWriter: StateWriter, events: EventBus, el: D3Selection) {
    this.state = state;
    this.stateWriter = stateWriter;
    this.el = el;
    this.dataHandler = new DataHandler(state, stateWriter);
    this.renderer = new Renderer(state, events, el);
  }

  public prepareData() {
    this.data = this.dataHandler.prepareData();
    this.stateWriter("data", this.data);
  }

  public draw() {
    const seriesConfig = this.state.current.getComputed().series;
    this.el.attr("width", seriesConfig.width).attr("height", seriesConfig.height);
    this.renderer.draw(this.data);
  }
}

export default Series;
