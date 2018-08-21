import PieChartCanvas from "./canvas"
import Series from "./series"
import PieChartFocus from "./focus"
import PieChartLegend from "./legend"
import Events from "../shared/event_catalog"
import StateHandler from "../shared/state_handler"
import EventEmitter from "../shared/event_bus"
import { isEmpty, uniqueId } from "lodash/fp"
import theme from "../utils/constants"

import {
  Accessors,
  AccessorsObject,
  Components,
  Computed,
  Data,
  Facade,
  FocusElement,
  PieChartConfig,
  RendererOptions,
} from "./typings"

const defaultConfig = (): PieChartConfig => {
  return {
    displayPercentages: true,
    duration: 1e3,
    focusOffset: 5,
    height: 500,
    hidden: false,
    legend: true,
    maxWidth: 100,
    maxLegendRatio: 1 / 2,
    maxLegendWidth: 200,
    maxTotalFontSize: 54,
    minChartWithLegend: 50,
    minWidth: 30,
    minInnerRadius: 30,
    minLegendWidth: 50,
    minTotalFontSize: 11,
    outerBorderMargin: 1,
    palette: theme.palettes.qualitative.generic,
    showComponentFocus: false,
    uid: uniqueId("piechart"),
    visualizationName: "piechart",
    width: 500,
  }
}

const defaultAccessors = (): AccessorsObject => {
  return {
    data: {
      data: (d: any): Data => d.data,
    },
    series: {
      name: (d: any): string => d.name || "",
      renderAs: (d: any): RendererOptions[] => d.renderAs,
    },
  }
}

class PieChartFacade implements Facade {
  private __disposed: boolean = false
  private canvas: PieChartCanvas
  private components: Components
  private context: Element
  private events: EventEmitter
  private series: Series
  private state: StateHandler<Data, PieChartConfig, AccessorsObject, Computed>

  constructor(context: Element) {
    this.context = context
    this.events = this.initializeEvents()
    this.state = this.initializeState()
    this.canvas = this.initializeCanvas()
    this.components = this.initializeComponents()
    this.series = this.initializeSeries()
  }

  private initializeEvents(): EventEmitter {
    return new EventEmitter()
  }

  private initializeState(): StateHandler<Data, PieChartConfig, AccessorsObject, Computed> {
    return new StateHandler({
      data: [],
      config: defaultConfig(),
      accessors: defaultAccessors(),
      computed: {},
    })
  }

  private initializeCanvas(): PieChartCanvas {
    return new PieChartCanvas(this.state.readOnly(), this.state.computedWriter(["canvas"]), this.events, this.context)
  }

  private initializeComponents(): Components {
    return {
      legend: new PieChartLegend(
        this.state.readOnly(),
        this.state.computedWriter(["legend"]),
        this.events,
        this.canvas.elementFor("legend"),
      ),
      focus: new PieChartFocus(this.state.readOnly(), this.state.computedWriter(["focus"]), this.events, {
        main: this.canvas.elementFor("focus"),
        component: this.canvas.elementFor("componentFocus"),
      }),
    }
  }

  private initializeSeries(): Series {
    return new Series(
      this.state.readOnly(),
      this.state.computedWriter(["series"]),
      this.events,
      this.canvas.elementFor("series"),
    )
  }

  data(data?: any): any {
    return this.state.data(data)
  }

  config(config?: Partial<PieChartConfig>): PieChartConfig {
    return this.state.config(config)
  }

  accessors(type: string, accessors: Accessors<any>): Accessors<any> {
    return this.state.accessors(type, accessors)
  }

  on(event: string, handler: any): void {
    this.events.on(event, handler)
  }

  off(event: string, handler: any): void {
    this.events.removeListener(event, handler)
  }

  draw(): void {
    this.state.captureState()
    this.series.assignData()
    this.components.legend.draw()
    this.canvas.draw()
    this.series.draw()

    // Focus behaviour is applied through events only - there is no focus.draw() method.
    const focusElement: FocusElement = this.state.config().focusElement
    !isEmpty(focusElement)
      ? this.events.emit(Events.FOCUS.ELEMENT.HIGHLIGHT, focusElement)
      : this.events.emit(Events.FOCUS.ELEMENT.OUT)
  }

  close(): void {
    if (this.__disposed) {
      return
    }
    this.__disposed = true
    this.events.removeAll()
    this.context.innerHTML = ""
  }
}

export default PieChartFacade
