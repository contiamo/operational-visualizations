import Events from "./event_catalog";
import * as styles from "./styles";

import {
  BaseConfig,
  ChartStateReadOnly,
  ComponentConfigInfo,
  ComponentHoverPayload,
  D3Selection,
  EventEmitter,
} from "./typings";

class ComponentFocus {
  private el: D3Selection;
  private events: EventEmitter;
  private state: ChartStateReadOnly<any, any, any, any>; // @TODO

  constructor(state: ChartStateReadOnly<any, any, any, any>, el: D3Selection, events: EventEmitter) {
    this.state = state;
    this.el = el.append("xhtml:div").attr("class", `${styles.focusLegend} ${styles.componentFocus}`);
    this.events = events;
    this.events.on(Events.FOCUS.COMPONENT.HOVER, this.onComponentHover.bind(this));
  }

  private onComponentHover(payload: ComponentHoverPayload) {
    if (!this.state.current.getConfig().showComponentFocus) {
      return;
    }
    this.events.emit(Events.FOCUS.CLEAR);
    this.events.emit(Events.FOCUS.ELEMENT.OUT);
    this.draw(payload);
  }

  private draw(payload: ComponentHoverPayload) {
    const componentPosition: ClientRect = payload.component.node().getBoundingClientRect();
    const canvasPosition: ClientRect = this.state.current.getComputed().canvas.containerRect;
    const elStyle = window.getComputedStyle(this.el.node());
    const topBorderWidth = parseInt(elStyle.borderTopWidth || "0", 10);
    const leftBorderWidth = parseInt(elStyle.borderLeftWidth || "0", 10);
    const config = this.state.current.getConfig() as Readonly<BaseConfig>;

    // Prevent component focus from going out of canvas.
    let top = componentPosition.top - canvasPosition.top - topBorderWidth;
    let left = componentPosition.left - canvasPosition.left - leftBorderWidth;
    let width = componentPosition.width;
    let height = componentPosition.height;

    if (top < 0) {
      width += top;
      top = 0;
    }
    if (left < 0) {
      height += left;
      left = 0;
    }
    if (top + height + 2 * topBorderWidth > config.height) {
      height -= top + height + 2 * topBorderWidth - config.height;
    }
    if (left + width + 2 * leftBorderWidth > config.width) {
      width -= left + width + 2 * leftBorderWidth - config.width;
    }

    this.el
      .style("width", `${componentPosition.width}px`)
      .style("height", `${componentPosition.height}px`)
      .style("top", `${top}px`)
      .style("left", `${left}px`)
      .style("visibility", "visible");

    // Track mouseover status (mouse over label)
    this.el.on("mouseleave", this.onMouseOut.bind(this));
    this.el.on("click", this.onClick.bind(this)(payload.options));
  }

  private onMouseOut() {
    this.remove();
  }

  private onClick(configOptions: ComponentConfigInfo): () => void {
    return () => {
      this.events.emit(Events.FOCUS.COMPONENT.CLICK, configOptions);
    };
  }

  public remove() {
    this.el.on("mouseleave", null);
    this.el.on("click", null);
    this.el.style("visibility", "hidden");
  }
}

export default ComponentFocus;
