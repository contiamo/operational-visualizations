import { Transition } from "d3-transition";
import { D3Selection } from "../shared/typings";
export declare type D3Transition = Transition<any, any, any, any>;
export declare const withD3Element: (func: any) => (this: any, datum: any, ...args: any[]) => any;
export declare type D3SelectionOrTransition = D3Selection | D3Transition;
export declare const onTransitionEnd: (selection: Transition<any, any, any, any>, func?: (() => void) | undefined) => any;
export declare type AttributeSetter<A> = (selection: D3Selection, attributes: Partial<A>, duration?: number, onEnd?: () => void) => void;
export declare const setPathAttributes: AttributeSetter<{
    path: any;
    fill: string | any;
    stroke: string | any;
    opacity: number | any;
    isTween: boolean;
}>;
export declare const setTextAttributes: AttributeSetter<{
    x: number | any;
    y: number | any;
    dx: number | any;
    dy: number | any;
    textAnchor: string | any;
    transform: string | any;
    text: string | any;
    opacity?: number | any;
}>;
export declare const setLineAttributes: AttributeSetter<{
    color: string | any;
    x: number | any;
    y: number | any;
    y1: number | any;
    y2: number | any;
    x1: number | any;
    x2: number | any;
}>;
export declare const setRectAttributes: AttributeSetter<{
    color: string | any;
    stroke: string | any;
    x: number | any;
    y: number | any;
    width: number | any;
    height: number | any;
}>;
//# sourceMappingURL=d3_utils.d.ts.map