import { ComputedWriter, D3Selection, EventEmitter, SeriesManager, State } from "./typings";
declare class ChartSeriesManager implements SeriesManager {
    private el;
    private events;
    private key;
    private oldSeries;
    private renderAs;
    private series;
    private state;
    private computedWriter;
    constructor(state: State, computedWriter: ComputedWriter, events: EventEmitter, el: D3Selection);
    private isNotHidden;
    private findBarsRenderer;
    assignData(): void;
    /**
     * Prepare the data for rendering.
     * - Remove hidden series from the data
     * - Assign bar indices to enable correct placement on the axis
     * - Transform grouped series into individual series which can be rendered independently
     */
    private prepareData;
    private updateOrCreate;
    /**
     * Assign bar index to each series
     * Grouped series will have the same bar index, while individual series will have unique indices
     * The bar indices are used to determine where bars are rendered respective to each tick.
     */
    private computeBarSeries;
    /**
     * There are 2 types of grouped series: ranges and stacks.
     * This method does the following:
     * - identifies the grouped series
     * - applies the appropriate calculations (provided as the `compute` argument) to each group of series
     * - returns each series of the group as as individual series object with its own rendering options,
     * so it can be rendered independently from the other series in the group.
     */
    private handleGroupedSeries;
    private computeRange;
    private computeStack;
    private get;
    private remove;
    private removeAllExcept;
    private dataForLegends;
    private dataForAxes;
    private axesWithFlags;
    private dataForFocus;
    private create;
    draw(): void;
}
export default ChartSeriesManager;
//# sourceMappingURL=series_manager.d.ts.map