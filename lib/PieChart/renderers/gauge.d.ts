import "d3-transition";
import { D3Selection, EventEmitter, InputData, LegendDatum, Renderer, RendererAccessor, RendererType, State } from "../typings";
declare class Gauge implements Renderer {
    private color;
    private comparison;
    private computed;
    private currentTranslation;
    private data;
    private drawn;
    private el;
    private events;
    private extent;
    private inputData;
    private previousComputed;
    private target;
    private total;
    key: RendererAccessor<string>;
    state: State;
    type: RendererType;
    value: RendererAccessor<number>;
    constructor(state: State, events: EventEmitter, el: D3Selection, options: {
        [key: string]: any;
    });
    updateOptions(options: {
        [key: string]: any;
    }): void;
    setData(data: InputData): void;
    draw(): void;
    private initialDraw;
    private updateDraw;
    private arcAttributes;
    private arcColor;
    private angleRange;
    private totalYOffset;
    private arcTween;
    private lineTween;
    private centerDisplayString;
    private updateComparison;
    private compute;
    private angleValue;
    private fillGaugeExtent;
    private runningTotal;
    private computeArcs;
    private computeOuterRadius;
    private computeInnerRadius;
    private onMouseOver;
    private updateElementHover;
    private highlightElement;
    private onMouseOut;
    dataForLegend(): LegendDatum[];
    remove(): void;
}
export default Gauge;
//# sourceMappingURL=gauge.d.ts.map