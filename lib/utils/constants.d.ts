/**
 * # Operational UI's visualization styling constants.
 *
 */
declare type FontWeight = 400 | 700;
declare const constants: {
    palettes: {
        qualitative: {
            generic: string[];
            pastel: string[];
            operational: string[];
        };
        sequential: {
            cool: string[];
            sharp: string[];
            intense: string[];
        };
        diverging: {
            rainbow: string[];
            earthy: string[];
        };
    };
    colors: {
        axis: {
            border: string;
            rules: string;
            label: string;
        };
        focus: {
            label: string;
            stroke: string;
        };
        white: string;
        primary: string;
        lightGrey: string;
    };
    font: {
        color: string;
        size: {
            /** 12 */
            default: number;
            /** 11 */
            small: number;
        };
        weight: {
            /** 400 */
            regular: FontWeight;
            /** 700 */
            bold: FontWeight;
        };
        small: {
            lineHeight: string;
            textTransform: string;
            letterSpacing: string;
            fontSize: number;
            fontWeight: number;
        };
        family: string;
    };
    space: {
        /** Small space is `4px` */
        small: number;
        /** Default space is `8px` */
        default: number;
    };
    borderRadius: number;
};
export default constants;
//# sourceMappingURL=constants.d.ts.map