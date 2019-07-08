import Series from "../chart_series";
import { AxisOrientation, D3Selection, Datum, LineRendererAccessors, RendererClass, SingleRendererOptionsParam, State } from "../../typings";
declare type Options = SingleRendererOptionsParam<LineRendererAccessors, "line">;
declare class Line implements RendererClass<LineRendererAccessors, "line"> {
    private data;
    private el;
    options: Options;
    private series;
    private state;
    type: "line";
    private xIsBaseline;
    private closeGaps;
    private color;
    private dashed;
    private interpolate;
    private opacity;
    private x;
    private adjustedX;
    private xScale;
    private y;
    private adjustedY;
    private yScale;
    constructor(state: State, el: D3Selection, data: Datum[], options: Options, series: Series);
    update(data: Datum[], options: Options): void;
    draw(): void;
    close(): void;
    dataForAxis(axis: AxisOrientation): any[];
    private appendSeriesGroup;
    private assignAccessors;
    private setAxisScales;
    private addMissingData;
    private isDefined;
    private startPath;
    private path;
}
export default Line;
//# sourceMappingURL=line.d.ts.map