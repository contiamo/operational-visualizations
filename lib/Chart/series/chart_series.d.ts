import { AxisOrientation, D3Selection, DateToFocus, Datum, EventEmitter, LegendDatum, LegendFloat, LegendPosition, RendererClass, RendererType, SingleRendererOptions, State } from "../typings";
export interface ChartSeriesOptions {
    datumAccessors?: {
        x?: (d: Datum) => number | string | Date;
        y?: (d: Datum) => number | string | Date;
    };
    [key: string]: any;
}
declare class ChartSeries {
    private el;
    private events;
    private oldRenderers;
    options: ChartSeriesOptions;
    renderers: RendererClass[];
    private state;
    private data;
    hide: () => boolean;
    hideInLegend: () => boolean;
    key: () => string;
    legendColor: () => string;
    legendName: () => string;
    renderAs: () => SingleRendererOptions[];
    symbolOffset: (d: Datum) => number;
    xAxis: () => "x1" | "x2";
    yAxis: () => "y1" | "y2";
    x: (d: Datum) => number | string | Date | undefined;
    y: (d: Datum) => number | string | Date | undefined;
    private axis;
    constructor(state: State, events: EventEmitter, el: D3Selection, options: ChartSeriesOptions);
    update(options: ChartSeriesOptions): void;
    assignAccessors(datumAccessors: ChartSeriesOptions["datumAccessors"]): void;
    private updateRenderers;
    private removeAllExcept;
    get(type: RendererType): RendererClass<import("../typings").LinearRendererAccessors | import("../typings").BarsRendererAccessors | import("../typings").FlagRendererAccessors | import("../typings").LineRendererAccessors | import("../typings").SymbolRendererAccessors | import("../typings").TextRendererAccessors, RendererType> | undefined;
    private addRenderer;
    private remove;
    dataForLegend(): LegendDatum;
    dataForAxis(axis: AxisOrientation): any[];
    legendPosition(): LegendPosition;
    legendFloat(): LegendFloat;
    displayFocusPoint(): boolean;
    hasFlags(): boolean;
    hasData(): boolean;
    valueAtFocus(focus: DateToFocus): {
        value: string | number | Date | undefined;
        valuePosition: any;
    };
    draw(): void;
}
export default ChartSeries;
//# sourceMappingURL=chart_series.d.ts.map