import { has, uniqueId } from "lodash/fp";
import EventEmitter from "../shared/event_bus";
import StateHandler from "../shared/state_handler";
import { colorAssigner } from "../utils/colorAssigner";
import theme from "../utils/constants";
import defaultNumberFormatter from "../utils/number_formatter";
import Breadcrumb from "./breadcrumb";
import SunburstCanvas from "./canvas";
import SunburstFocus from "./focus";
import Renderer from "./renderer";
import RootLabel from "./root_label";
import { Accessors, AccessorsObject, Components, Computed, Data, Facade, SunburstConfig } from "./typings";

const defaultConfig = (): SunburstConfig => {
  return {
    backgroundColor: theme.colors.white,
    arrowOffset: 10,
    breadcrumbItemWidth: 80,
    centerCircleRadius: 0.9,
    disableAnimations: false,
    duration: 1e3,
    focusOffset: 5,
    height: 500,
    hidden: false,
    maxBreadcrumbLength: 4,
    maxRings: 10,
    maxTotalFontSize: 54,
    minTotalFontSize: theme.font.small.fontSize,
    numberFormatter: defaultNumberFormatter,
    outerBorderMargin: 1,
    palette: theme.palettes.qualitative.generic,
    propagateColors: true,
    sort: true,
    uid: uniqueId("sunburst"),
    visualizationName: "sunburst",
    width: 500,
  };
};

const defaultColorAssigner = (palette: string[]): ((key: string) => string) => {
  return colorAssigner(palette);
};

const defaultAccessors = (): AccessorsObject => {
  const assignColors = defaultColorAssigner(defaultConfig().palette);
  return {
    data: {
      data: (data: any): Data => data,
    },
    series: {
      color: (d: Data): string => assignColors(d.name || ""),
      id: (d: Data) => d.name || uniqueId("series"),
      name: (d: Data) => d.name || "",
      value: (d: Data) => d.value || 0,
    },
  };
};

const defaultComputed = (): Computed => ({
  canvas: {
    drawingDims: { width: 0, height: 0 },
    containerRect: new DOMRect(),
  },
  breadcrumb: {},
  focus: {},
  renderer: {
    innerRadius: 0,
    data: [],
  },
  rootLabel: {},
});

class SunburstFacade implements Facade {
  private DISPOSED: boolean = false;
  private canvas: SunburstCanvas;
  private components: Components;
  private context: Element;
  private customColorAccessor: boolean = false;
  private events: EventEmitter;
  private state: StateHandler<Data, SunburstConfig, AccessorsObject, Computed>;

  constructor(context: Element) {
    this.context = context;
    this.events = this.initializeEvents();
    this.state = this.initializeState();
    this.canvas = this.initializeCanvas();
    this.components = this.initializeComponents();
  }

  private initializeEvents(): EventEmitter {
    return new EventEmitter();
  }

  private initializeState(): StateHandler<Data, SunburstConfig, AccessorsObject, Computed> {
    return new StateHandler({
      data: {},
      config: defaultConfig(),
      accessors: defaultAccessors(),
      computed: defaultComputed(),
    });
  }

  private initializeCanvas(): SunburstCanvas {
    return new SunburstCanvas(this.state.readOnly(), this.state.computedWriter(["canvas"]), this.events, this.context);
  }

  private initializeComponents(): Components {
    return {
      breadcrumb: new Breadcrumb(
        this.state.readOnly(),
        this.state.computedWriter(["breadcrumb"]),
        this.events,
        this.canvas.elementFor("breadcrumb"),
      ),
      focus: new SunburstFocus(
        this.state.readOnly(),
        this.state.computedWriter(["focus"]),
        this.events,
        this.canvas.elementFor("focus"),
      ),
      renderer: new Renderer(
        this.state.readOnly(),
        this.state.computedWriter(["renderer"]),
        this.events,
        this.canvas.elementFor("series"),
      ),
      rootLabel: new RootLabel(
        this.state.readOnly(),
        this.state.computedWriter(["rootLabel"]),
        this.events,
        this.canvas.elementFor("rootLabel"),
      ),
    };
  }

  public data(data?: Data): Data {
    return this.state.data(data);
  }

  public config(config?: Partial<SunburstConfig>): SunburstConfig {
    if (config && config.palette && !this.customColorAccessor) {
      const assignColors: (key: string, color?: string) => string = defaultColorAssigner(config.palette);
      this.accessors("series", {
        color: (d: Data): string => assignColors(d.name || "", d.color),
      });
    }
    return this.state.config(config);
  }

  public accessors(type: string, accessors: Accessors<any>): Accessors<any> {
    if (type === "series" && has("color")(accessors)) {
      this.customColorAccessor = true;
    }
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
    this.canvas.draw();
    this.components.renderer.draw();
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

export default SunburstFacade;
