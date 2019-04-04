import ComponentFocus from "../shared/component_focus";
import Events from "../shared/event_catalog";
import DateFocus from "./focus/date_focus";
import ElementFocus from "./focus/element_focus";
import FlagFocus from "./focus/flag_focus";
import { D3Selection, EventEmitter, Focus, State, StateWriter } from "./typings";

class ChartFocus implements Focus {
  private componentFocus: ComponentFocus;
  private dateFocus: DateFocus;
  private elementFocus: ElementFocus;
  private flagFocus: FlagFocus;
  private state: State;
  private events: EventEmitter;

  constructor(state: State, _: StateWriter, events: EventEmitter, els: { [key: string]: D3Selection }) {
    this.state = state;
    this.events = events;
    this.componentFocus = new ComponentFocus(this.state, els.component, this.events);
    this.dateFocus = new DateFocus(this.state, els, this.events);
    this.elementFocus = new ElementFocus(this.state, els, this.events);
    this.flagFocus = new FlagFocus(this.state, els.main, this.events);
    this.events.on(Events.FOCUS.CLEAR, this.remove.bind(this));
    this.events.on(Events.CHART.OUT, this.remove.bind(this));
  }

  public remove() {
    this.componentFocus.remove();
    this.elementFocus.remove();
    this.dateFocus.remove();
    this.flagFocus.remove();
  }
}

export default ChartFocus;
