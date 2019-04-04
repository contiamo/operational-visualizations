import { forEach, initial, tail, zip } from "lodash/fp";
import Events from "../shared/event_catalog";
import Links from "./renderers/links";
import Nodes from "./renderers/nodes";
import { D3Selection, Data, EventEmitter, FocusElement, PathFocusElement, State } from "./typings";

class Renderer {
  private links: Links;
  private nodes: Nodes;
  private el: D3Selection;
  private events: EventEmitter;

  constructor(state: State, events: EventEmitter, el: D3Selection) {
    this.events = events;
    this.el = el;
    this.links = new Links(state, events, el);
    this.nodes = new Nodes(state, events, el);
    this.events.on(Events.FOCUS.ELEMENT.HIGHLIGHT, this.focusElement.bind(this));
  }

  public draw(data: Data) {
    this.links.draw(data.links);
    this.nodes.draw(data.nodes);
  }

  private focusElement(focusElement: FocusElement) {
    switch (focusElement.type) {
      case "path":
        this.highlightPath(focusElement);
        break;
      case "node":
        this.nodes.focusElement(focusElement);
        break;
      case "link":
        this.links.focusElement(focusElement);
        break;
    }
  }

  private highlightPath(focusElement: PathFocusElement) {
    this.events.emit(Events.FOCUS.ELEMENT.OUT);

    const path = focusElement.matchers.path;
    const links = zip(initial(path))(tail(path));

    forEach((link: [string, string]) => {
      this.links.focusElement({
        type: "link",
        matchers: {
          sourceId: link[0],
          targetId: link[1],
        },
      });
    })(links);
  }

  public close() {
    this.el.node().innerHTML = "";
  }
}

export default Renderer;
