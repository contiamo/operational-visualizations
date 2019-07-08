import { BarSeries, DiscreteInputDatum, Rule } from "./typings";
interface Config {
    outerBarSpacing: number;
    innerBarSpacing: number;
    minBarWidth: number;
}
export declare const computeBarPositions: (range: [number, number], nTicks: number, config: Config, barSeries: Record<string, BarSeries>) => {
    width: (seriesId: string) => number;
    offset: (seriesId: string) => number;
};
export declare const computeTickWidth: (range: [number, number], nTicks: number, hasBars?: boolean | undefined) => number;
export declare const computeRuleTicks: (datum: DiscreteInputDatum<any, any>, scale: any) => Rule[];
export {};
//# sourceMappingURL=discrete_axis_utils.d.ts.map