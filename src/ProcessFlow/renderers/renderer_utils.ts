import { scaleLinear } from "d3-scale";
import { every, invoke, LodashEvery, map } from "lodash/fp";
import { D3Selection, Scale, TLink, TNode, WithConvert } from "../typings";

export const sizeScale = (range: [number, number], data: TNode[] | TLink[]): Scale => {
  const sizes = map((el: TNode | TLink) => el.size())(data);
  return scaleLinear()
    .domain([0, Math.max(...sizes)])
    .range(range);
};

export const filterByMatchers = (matchers: Record<string, any>) => {
  return (d: any) => {
    return (every as WithConvert<LodashEvery>).convert({ cap: false })((value: any, matcher: string) => {
      return !!(d as any)[matcher] && invoke(matcher)(d) === value;
    })(matchers);
  };
};

export const exitGroups = (groups: D3Selection) => {
  groups
    .exit()
    .on("mouseenter", null)
    .on("mouseleave", null)
    .remove();
};
