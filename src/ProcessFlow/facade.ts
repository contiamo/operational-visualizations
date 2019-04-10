import { uniqueId } from "lodash/fp";
import Events from "../shared/event_catalog";
import EventEmitter from "../shared/event_emitter";
import StateHandler from "../shared/state_handler";
import theme from "../utils/constants";
import defaultNumberFormatter from "../utils/number_formatter";
import ProcessFlowCanvas from "./canvas";
import ProcessFlowFocus from "./focus";
import Series from "./series";

import {
  Accessors,
  AccessorsObject,
  Components,
  Computed,
  Facade,
  FocusElement,
  InputData,
  LinkAttrs,
  NodeAttrs,
  ProcessFlowConfig,
  TNode,
} from "./typings";

const defaultConfig = (): ProcessFlowConfig => ({
  backgroundColor: theme.colors.white,
  borderColor: "#fff",
  duration: 1e3,
  focusElement: { type: "none" },
  focusLabelPosition: "toRight",
  height: Infinity,
  hidden: false,
  highlightColor: "#1499CE",
  horizontalNodeSpacing: 100,
  labelOffset: 1,
  linkBorderWidth: 4,
  maxLinkWidth: 8,
  maxNodeSize: 1500,
  minLinkWidth: 1,
  minNodeSize: 100,
  nodeBorderWidth: 10,
  numberFormatter: defaultNumberFormatter,
  showLinkFocusLabels: true,
  showNodeFocusLabels: true,
  uid: uniqueId("processflow"),
  verticalNodeSpacing: 100,
  visualizationName: "processflow",
  width: Infinity,
});

const defaultAccessors = (): AccessorsObject => ({
  data: {
    nodes: (d: InputData) => d.nodes,
    journeys: (d: InputData) => d.journeys,
  },
  node: {
    color: (d: NodeAttrs): string => d.color || "#fff",
    content: (d: NodeAttrs): Array<Record<string, any>> => d.content || [],
    shape: (d: NodeAttrs): string => d.shape || "squareDiamond",
    size: (d: NodeAttrs): number => d.size || 1,
    stroke: (d: NodeAttrs): string => d.stroke || "#000",
    id: (d: NodeAttrs): string => d.id || uniqueId("node"),
    label: (d: NodeAttrs): string => d.label || d.id || "",
    labelPosition: (d: NodeAttrs): string => d.labelPosition || "right",
  },
  link: {
    content: (d: NodeAttrs): Array<Record<string, any>> => d.content || [],
    dash: (d: LinkAttrs): string => d.dash || "0",
    label: (d: LinkAttrs): string => `${d.label || d.source.label()} → ${d.target.label() || ""}`,
    size: (d: LinkAttrs): number => d.size || 1,
    stroke: (d: LinkAttrs): string => d.stroke || "#bbb",
    source: (d: LinkAttrs): TNode | undefined => d.source,
    sourceId: (d: LinkAttrs): string | undefined => d.sourceId,
    target: (d: LinkAttrs): TNode | undefined => d.target,
    targetId: (d: LinkAttrs): string | undefined => d.targetId,
  },
});

const defaultComputed = (): Computed => {
  const config = defaultConfig();
  return {
    canvas: {
      elRect: new DOMRect(),
      containerRect: new DOMRect(),
    },
    focus: {},
    series: {
      data: {
        journeys: [],
        nodes: [],
        links: [],
      },
      horizontalNodeSpacing: config.horizontalNodeSpacing,
      width: config.width,
      height: config.height,
    },
  };
};

class ProcessFlowFacade implements Facade {
  private DISPOSED: boolean = false;
  private canvas: ProcessFlowCanvas;
  private context: Element;
  private events: EventEmitter;
  private seriesManager: Series;
  private state: StateHandler<InputData, ProcessFlowConfig, AccessorsObject, Computed>;

  constructor(context: Element) {
    this.context = context;
    this.events = this.initializeEvents();
    this.state = this.initializeState();
    this.canvas = this.initializeCanvas();
    this.initializeComponents();
    this.seriesManager = this.initializeSeries();
  }

  private initializeEvents(): EventEmitter {
    return new EventEmitter();
  }

  private initializeState(): StateHandler<InputData, ProcessFlowConfig, AccessorsObject, Computed> {
    return new StateHandler({
      data: {},
      config: defaultConfig(),
      accessors: defaultAccessors(),
      computed: defaultComputed(),
    });
  }

  private initializeCanvas(): ProcessFlowCanvas {
    return new ProcessFlowCanvas(
      this.state.readOnly(),
      this.state.getComputedWriter(["canvas"]),
      this.events,
      this.context,
    );
  }

  private initializeComponents(): Components {
    return {
      focus: new ProcessFlowFocus(
        this.state.readOnly(),
        this.state.getComputedWriter(["focus"]),
        this.events,
        this.canvas.elementFor("focus"),
      ),
    };
  }

  private initializeSeries(): Series {
    return new Series(
      this.state.readOnly(),
      this.state.getComputedWriter(["series"]),
      this.events,
      this.canvas.elementFor("series"),
    );
  }

  public data<T>(data?: T) {
    return this.state.data(data);
  }

  public config(config?: Partial<ProcessFlowConfig>): ProcessFlowConfig {
    return this.state.config(config);
  }

  public accessors(type: string, accessors: Accessors<any>): Accessors<any> {
    return this.state.accessors(type, accessors);
  }

  public on(event: string, handler: (e: any) => void) {
    this.events.on(event, handler);
  }

  public off(event: string, handler: (e: any) => void) {
    this.events.removeListener(event, handler);
  }

  public draw() {
    this.state.captureState();
    this.seriesManager.prepareData();
    this.canvas.draw();
    this.seriesManager.draw();

    // Focus behaviour is applied through events only - there is no focus.draw() method.
    const focusElement: FocusElement = this.state.config().focusElement;
    focusElement.type !== "none"
      ? this.events.emit(Events.FOCUS.ELEMENT.HIGHLIGHT, focusElement)
      : this.events.emit(Events.FOCUS.ELEMENT.OUT);
  }

  public close() {
    if (this.DISPOSED) {
      return;
    }
    this.DISPOSED = true;
    this.canvas.remove();
    this.events.removeAll();
    this.context.innerHTML = "";
  }
}

export default ProcessFlowFacade;
