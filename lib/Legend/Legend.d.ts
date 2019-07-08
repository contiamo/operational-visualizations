interface LegendDatum {
    label: string;
    color: string;
    key: string;
}
declare type LegendData = LegendDatum[];
export interface Props {
    style?: {};
    title?: string;
    data: LegendData;
}
declare const Legend: (props: Props) => JSX.Element;
export default Legend;
//# sourceMappingURL=Legend.d.ts.map