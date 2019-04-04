import { forEach, get, reduce } from "lodash/fp";
import * as styles from "../shared/styles";
import ChartLegend from "./legend/legend";
import { D3Selection, EventEmitter, LegendDatum, LegendFloat, LegendPosition, State, StateWriter } from "./typings";

interface LegendOption {
  position: LegendPosition;
  float: LegendFloat;
}

const legendOptions: LegendOption[] = [
  { position: "top", float: "left" },
  { position: "top", float: "right" },
  { position: "bottom", float: "left" },
];

class LegendManager {
  private legends: { [key: string]: { [key: string]: ChartLegend } } = { top: {}, bottom: {} };
  private state: State;

  constructor(
    state: State,
    stateWriter: StateWriter,
    events: EventEmitter,
    els: { [key: string]: { [key: string]: D3Selection } },
  ) {
    this.state = state;

    forEach((option: LegendOption) => {
      const el: D3Selection = els[option.position][option.float];
      this.legends[option.position][option.float] = new ChartLegend(state, stateWriter, events, el);
    })(legendOptions);
  }

  public draw() {
    forEach((option: LegendOption) => {
      const data: LegendDatum[] = get([option.position, option.float])(
        this.state.current.getComputed().series.dataForLegends,
      );
      this.legends[option.position][option.float].setData(data);
      this.legends[option.position][option.float].draw();
    })(legendOptions);
    this.arrangeTopLegends();
  }

  // Ensure the 2 top legends (left/right) make sensible use of the available space.
  private arrangeTopLegends() {
    const drawingWidth = this.state.current.getConfig().width;
    const left = this.legends.top.left;
    const right = this.legends.top.right;

    const leftWidth = left.el.node().getBoundingClientRect().width;
    const rightWidth = right.el.node().getBoundingClientRect().width;

    if (leftWidth + rightWidth <= drawingWidth) {
      return;
    }

    if (leftWidth < drawingWidth / 2) {
      right.setWidth(drawingWidth - leftWidth);
      return;
    }

    if (rightWidth < drawingWidth / 2) {
      left.setWidth(drawingWidth - rightWidth);
      return;
    }

    // Give the legend which takes up more space as much as possible
    const leftIsLonger = leftWidth > rightWidth;
    const longer = leftIsLonger ? left : right;
    const shorter = leftIsLonger ? right : left;

    longer.setWidth(drawingWidth / 2);
    const maxLongerWidth = this.calculateMaxWidth(longer);
    longer.setWidth(maxLongerWidth);

    shorter.setWidth(
      drawingWidth -
        maxLongerWidth -
        parseInt(shorter.el.style(`padding-left`), 10) -
        parseInt(shorter.el.style(`padding-right`), 10),
    );
    const maxShorterWidth = this.calculateMaxWidth(shorter);
    shorter.setWidth(maxShorterWidth);
  }

  private calculateMaxWidth(legend: ChartLegend): number {
    const nodes = legend.el.selectAll(`div.${styles.seriesLegend}`).nodes();
    const maxNodeWidth = reduce((maxWidth: number, node: any) => {
      return Math.max(maxWidth, node.getBoundingClientRect().width);
    }, 0)(nodes);
    return maxNodeWidth + parseInt(legend.el.style(`padding-left`), 10) + parseInt(legend.el.style(`padding-left`), 10);
  }
}

export default LegendManager;
