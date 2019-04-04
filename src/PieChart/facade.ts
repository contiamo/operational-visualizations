import * as d3 from "d3-selection";
import { isEmpty, uniqueId } from "lodash/fp";
import Events from "../shared/event_catalog";
import EventEmitter from "../shared/event_emitter";
import StateHandler from "../shared/state_handler";
import theme from "../utils/constants";
import PieChartCanvas from "./canvas";
import PieChartFocus from "./focus";
import PieChartLegend from "./legend";
import Series from "./series";

import {
  Accessors,
  AccessorsObject,
  Components,
  Computed,
  Data,
  Facade,
  FocusElement,
  InputData,
  PieChartConfig,
  RendererOptions,
} from "./typings";

const defaultConfig = (): PieChartConfig => ({
  backgroundColor: theme.colors.white,
  displayPercentages: true,
  duration: 1e3,
  focusOffset: 5,
  height: 500,
  hidden: false,
  legend: true,
  maxWidth: 100,
  maxTotalFontSize: 54,
  minWidth: 30,
  minInnerRadius: 30,
  minTotalFontSize: 11,
  outerBorderMargin: 1,
  palette: theme.palettes.qualitative.generic,
  showComponentFocus: false,
  uid: uniqueId("piechart"),
  visualizationName: "piechart",
  width: 500,
});

const defaultData = (): Data => ({
  data: [],
  renderAs: [{ type: "donut" }],
});

const defaultAccessors = (): AccessorsObject => ({
  data: {
    data: (d: any): InputData => d.data,
  },
  series: {
    name: (d: any): string => d.name || "",
    renderAs: (d: any): RendererOptions[] => d.renderAs,
  },
});

const defaultComputed = (): Computed => ({
  canvas: {
    containerRect: new DOMRect(),
    drawingContainerDims: { width: 0, height: 0 },
    drawingContainerRect: new DOMRect(),
    elements: {},
    legend: d3.select(document.createElementNS(d3.namespaces.xhtml, "div")),
  },
  focus: {},
  legend: {},
  series: {
    data: [],
    dataForLegend: [],
  },
});

class PieChartFacade implements Facade {
  private DISPOSED: boolean = false;
  private canvas: PieChartCanvas;
  private components: Components;
  private context: Element;
  private events: EventEmitter;
  private series: Series;
  private state: StateHandler<Data, PieChartConfig, AccessorsObject, Computed>;

  constructor(context: Element) {
    this.context = context;
    this.events = this.initializeEvents();
    this.state = this.initializeState();
    this.canvas = this.initializeCanvas();
    this.components = this.initializeComponents();
    this.series = this.initializeSeries();
  }

  private initializeEvents(): EventEmitter {
    return new EventEmitter();
  }

  private initializeState(): StateHandler<Data, PieChartConfig, AccessorsObject, Computed> {
    return new StateHandler({
      data: defaultData(),
      config: defaultConfig(),
      accessors: defaultAccessors(),
      computed: defaultComputed(),
    });
  }

  private initializeCanvas(): PieChartCanvas {
    return new PieChartCanvas(this.state.readOnly(), this.state.getStateWriter(["canvas"]), this.events, this.context);
  }

  private initializeComponents(): Components {
    return {
      legend: new PieChartLegend(
        this.state.readOnly(),
        this.state.getStateWriter(["legend"]),
        this.events,
        this.canvas.elementFor("legend"),
      ),
      focus: new PieChartFocus(this.state.readOnly(), this.state.getStateWriter(["focus"]), this.events, {
        main: this.canvas.elementFor("focus"),
        component: this.canvas.elementFor("componentFocus"),
      }),
    };
  }

  private initializeSeries(): Series {
    return new Series(
      this.state.readOnly(),
      this.state.getStateWriter(["series"]),
      this.events,
      this.canvas.elementFor("series"),
    );
  }

  public data(data?: Data) {
    return this.state.data(data);
  }

  public config(config?: Partial<PieChartConfig>): PieChartConfig {
    return this.state.config(config);
  }

  public accessors(type: string, accessors: Accessors<any>): Accessors<any> {
    return this.state.accessors(type, accessors);
  }

  public on(event: string, handler: any) {
    this.events.on(event, handler);
  }

  public off(event: string, handler: any) {
    this.events.removeListener(event, handler);
  }

  public draw() {
    this.state.captureState();
    this.series.assignData();
    this.components.legend.draw();
    this.canvas.draw();
    this.series.draw();

    // Focus behaviour is applied through events only - there is no focus.draw() method.
    const focusElement: FocusElement = this.state.config().focusElement;
    !isEmpty(focusElement)
      ? this.events.emit(Events.FOCUS.ELEMENT.HIGHLIGHT, focusElement)
      : this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  public close() {
    if (this.DISPOSED) {
      return;
    }
    this.DISPOSED = true;
    this.events.removeAll();
    this.context.innerHTML = "";
  }
}

export default PieChartFacade;
