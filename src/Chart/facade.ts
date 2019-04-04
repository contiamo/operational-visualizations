import { has, isEmpty, uniqueId } from "lodash/fp";
import { defaultMargins } from "../axis_utils/axis_config";
import Events from "../shared/event_catalog";
import EventEmitter from "../shared/event_emitter";
import StateHandler from "../shared/state_handler";
import { colorAssigner } from "../utils/colorAssigner";
import theme from "../utils/constants";
import defaultNumberFormatter from "../utils/number_formatter";
import AxesManager from "./axes_manager";
import ChartCanvas from "./canvas";
import ChartFocus from "./focus";
import LegendManager from "./legend_manager";
import ChartSeriesManager from "./series_manager";

import {
  Accessors,
  AccessorsObject,
  AxesData,
  AxisPosition,
  ChartConfig,
  Components,
  Computed,
  Data,
  Datum,
  Facade,
  FocusElement,
  RendererOptions,
  SeriesData,
} from "./typings";

const defaultConfig = (): ChartConfig => {
  return {
    backgroundColor: theme.colors.white,
    duration: 1e3,
    flagFocusOffset: 15,
    focusDateOptions: ["line", "points", "label"],
    focusOffset: 5,
    height: 500,
    hidden: false,
    innerBarSpacing: 2,
    innerBarSpacingCategorical: 0.2,
    legend: true,
    maxBarWidthRatio: 1 / 3,
    maxFocusLabelWidth: 350,
    minBarWidth: 3,
    noAxisMargin: 15,
    numberFormatter: defaultNumberFormatter,
    outerBarSpacing: 10,
    palette: theme.palettes.qualitative.generic,
    showComponentFocus: false,
    timeAxisPriority: ["x1", "x2", "y1", "y2"],
    uid: uniqueId("chart"),
    visualizationName: "chart",
    width: 500,
  };
};

const defaultComputed = (): Computed => ({
  axes: {
    barPositions: {
      width: () => 0,
      offset: () => 0,
    },
    baseline: "x",
    computed: {},
    margins: defaultMargins(defaultConfig().noAxisMargin),
    previous: {},
    priorityTimeAxis: "x1",
    requiredAxes: [],
  },
  canvas: {
    drawingContainerDims: { width: 0, height: 0 },
    drawingDims: { width: 0, height: 0 },
    containerRect: new DOMRect(),
  },
  series: {
    dataForLegends: {
      top: {
        left: [],
        right: [],
      },
      bottom: {
        left: [],
      },
    },
    dataForAxes: {},
    barSeries: {},
    axesWithFlags: {},
    dataForFocus: () => [],
  },
});

const defaultColorAssigner = (palette: string[]): ((d: { [key: string]: any }) => string) => {
  const assigner = colorAssigner(palette);
  return (d: { [key: string]: any }): string => d.legendColor || assigner(d.key);
};

const defaultAccessors = () => {
  return {
    data: {
      series: (d: Data): SeriesData => d.series || [],
      axes: (d: Data): AxesData => d.axes || {},
    },
    series: {
      data: (d: { [key: string]: any }): Datum[] => d.data,
      hide: (d: { [key: string]: any }): boolean => d.hide || false,
      hideInLegend: (d: { [key: string]: any }): boolean => d.hideInLegend || false,
      key: (d: { [key: string]: any }): string => d.key || uniqueId("key"),
      legendColor: defaultColorAssigner(defaultConfig().palette),
      legendName: (d: { [key: string]: any }): string => d.name || d.key || "",
      renderAs: (d: { [key: string]: any }): RendererOptions[] => d.renderAs,
      axis: (d: { [key: string]: any }): AxisPosition => d.axis || "x1", // Only used for flags
      xAxis: (d: { [key: string]: any }): "x1" | "x2" => d.xAxis || "x1",
      yAxis: (d: { [key: string]: any }): "y1" | "y2" => d.yAxis || "y1",
    },
  };
};

class ChartFacade implements Facade {
  private DISPOSED: boolean = false;
  private canvas: ChartCanvas;
  private components: Components;
  private context: Element;
  private customColorAccessor: boolean = false;
  private events: EventEmitter;
  private series: ChartSeriesManager;
  private state: StateHandler<Data, ChartConfig, AccessorsObject, Computed>;

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

  private initializeState(): StateHandler<Data, ChartConfig, AccessorsObject, Computed> {
    return new StateHandler({
      data: {},
      config: defaultConfig(),
      accessors: defaultAccessors(),
      computed: defaultComputed(),
    });
  }

  private initializeCanvas(): ChartCanvas {
    return new ChartCanvas(this.state.readOnly(), this.state.getStateWriter(["canvas"]), this.events, this.context);
  }

  private initializeComponents(): any {
    return {
      axes: new AxesManager(this.state.readOnly(), this.state.getStateWriter("axes"), this.events, {
        xAxes: this.canvas.elementFor("xAxes"),
        xRules: this.canvas.elementFor("xRules"),
        yAxes: this.canvas.elementFor("yAxes"),
        yRules: this.canvas.elementFor("yRules"),
      }),
      legends: new LegendManager(this.state.readOnly(), this.state.getStateWriter(["legend"]), this.events, {
        top: {
          left: this.canvas.elementFor("legend-top-left"),
          right: this.canvas.elementFor("legend-top-right"),
        },
        bottom: {
          left: this.canvas.elementFor("legend-bottom-left"),
        },
      }),
      focus: new ChartFocus(this.state.readOnly(), this.state.getStateWriter(["focus"]), this.events, {
        main: this.canvas.elementFor("focus"),
        component: this.canvas.elementFor("componentFocus"),
        group: this.canvas.elementFor("focusGroup"),
      }),
    };
  }

  private initializeSeries(): ChartSeriesManager {
    return new ChartSeriesManager(
      this.state.readOnly(),
      this.state.getStateWriter(["series"]),
      this.events,
      this.canvas.elementFor("series"),
    );
  }

  public data(data?: Data): Data {
    return this.state.data(data);
  }

  public config(config?: Partial<ChartConfig>): ChartConfig {
    /**
     * Changing the palette config only updates the legendColor accessor if the default is still be used.
     * It will not overwrite a user-defined legendColor accessor.
     */
    if (config && config.palette && !this.customColorAccessor) {
      this.state.accessors("series", { legendColor: defaultColorAssigner(config.palette) });
    }
    return this.state.config(config);
  }

  public accessors(type: string, accessors: Accessors<any>): Accessors<any> {
    // If a custom legendColor accessor is specified, this must not be overwritten if the palette config changes.
    if (type === "series" && has("legendColor")(accessors)) {
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
    this.series.assignData();
    this.components.legends.draw();
    this.components.axes.updateMargins();
    this.canvas.draw();
    this.components.axes.draw();
    this.series.draw();

    // Focus behaviour is applied through events only - there is no focus.draw() method.
    const focus: FocusElement = this.state.config().focus;
    !isEmpty(focus)
      ? this.events.emit(focus.type === "date" ? Events.FOCUS.DATE : Events.FOCUS.ELEMENT.HIGHLIGHT, focus.value)
      : this.events.emit(Events.FOCUS.CLEAR);
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

export default ChartFacade;
