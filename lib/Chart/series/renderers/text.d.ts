import Series from "../chart_series";
import { AxisOrientation, D3Selection, Datum, RendererClass, SingleRendererOptionsParam, State, TextRendererAccessors } from "../../typings";
declare type Options = SingleRendererOptionsParam<TextRendererAccessors, "text">;
declare class Text implements RendererClass<TextRendererAccessors, "text"> {
    private data;
    private el;
    options: Options;
    private series;
    private state;
    type: "text";
    private xIsBaseline;
    private size;
    private opacity;
    private x;
    private xScale;
    private y;
    private yScale;
    private offset;
    private tilt;
    constructor(state: State, el: D3Selection, data: Datum[], options: Options, series: Series);
    update(data: Datum[], options: Options): void;
    dataForAxis(axis: AxisOrientation): any[];
    draw(): void;
    close(): void;
    private appendSeriesGroup;
    private assignAccessors;
    private assignConfig;
    private setAxisScales;
    private validate;
    private startAttributes;
    private attributes;
}
export default Text;
//# sourceMappingURL=text.d.ts.map