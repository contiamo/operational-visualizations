import { interpolateObject } from "d3-interpolate";
import { select } from "d3-selection";
import { Pie, pie as d3Pie, PieArcDatum } from "d3-shape";
import { defaults, forEach, LodashForEach, map, reduce } from "lodash/fp";
import { colorAssigner } from "../../utils/colorAssigner";
import theme from "../../utils/constants";
import { withD3Element } from "../../utils/d3_utils";
import { approxZero, stepFunction } from "../../utils/font_sizing_utils";
import * as styles from "./styles";

import {
  Accessor,
  ComputedArcs,
  ComputedData,
  ComputedDatum,
  D3Selection,
  Datum,
  Dimensions,
  InputData,
  InputDatum,
  Renderer,
  RendererAccessor,
  RendererAccessors,
  WithConvert,
} from "../typings";

export const assignOptions = (ctx: Renderer, options: Record<string, any>) => {
  (forEach as WithConvert<LodashForEach>).convert({ cap: false })((option: any, key: string) => {
    if (key !== "accessors") {
      (ctx as any)[key] = option;
    }
  })(options);
  assignAccessors(ctx, options.accessors);
};

export const defaultAccessors = (ctx: Renderer): RendererAccessors => {
  const assignColor = colorAssigner(ctx.state.current.getConfig().palette);
  return {
    value: (d: InputDatum) => d.value || 0,
    key: (d: InputDatum) => d.key || "",
    color: (d: InputDatum) => (d.unfilled ? theme.colors.lightGrey : assignColor(ctx.key(d))),
  };
};

export const assignAccessors = (ctx: Renderer, customAccessors: Partial<RendererAccessors>) => {
  const accessors: RendererAccessors = defaults(defaultAccessors(ctx))(customAccessors);
  (forEach as WithConvert<LodashForEach>).convert({ cap: false })((option: any, key: string) => {
    (ctx as any)[key] = (d: any): any => option(d.data || d);
  })(accessors);
};

// Establish coordinate system with 0,0 being the center of the width, height rectangle
export const computeTranslate = (drawingDims: Dimensions, yOffset: number = 0): [number, number] => [
  drawingDims.width / 2,
  (drawingDims.height + yOffset) / 2,
];

// Translate back to 0,0 in top left
export const translateBack = (point: [number, number], currentTranslation: [number, number]): [number, number] => [
  point[0] + currentTranslation[0],
  point[1] + currentTranslation[1],
];

export const textAttributes = (computed: ComputedArcs) => ({
  transform: (d: Datum) => translateString(computed.arcOver.centroid(d)),
  text: percentageString,
  textAnchor: "middle",
});

export const percentageString = (d: ComputedDatum) => (d.data.percentage ? d.data.percentage.toFixed(1) + "%" : null);

export const translateString = (values: [number, number]) => `translate(${values.join(", ")})`;

export const createArcGroups = (el: D3Selection, data: ComputedDatum[], key: RendererAccessor<string>) =>
  el
    .select("g.arcs")
    .selectAll(`g.${styles.arc}`)
    .data(data, d => key(d as PieArcDatum<Datum>));

export const exitArcs = (arcs: D3Selection, duration: number, path: any) => {
  const exitingArcs = arcs.exit();

  exitingArcs
    .transition()
    .duration(duration)
    .select("path")
    .attrTween("d", path);

  exitingArcs
    .transition()
    .duration(duration)
    .select(`text.${styles.label}`)
    .style("opacity", "1e6");

  exitingArcs.remove();
};

export const enterArcs = (arcs: D3Selection, mouseOverHandler: any, mouseOutHandler: any) => {
  const enteringArcs = arcs
    .enter()
    .append("svg:g")
    .attr("class", styles.arc)
    .on("mouseenter", mouseOverHandler)
    .on("mouseout", mouseOutHandler);

  enteringArcs.append("svg:path");
  enteringArcs.append("svg:rect").attr("class", styles.labelBackground);
  enteringArcs.append("svg:text").attr("class", styles.label);
};

const RECT_PADDING = 2;

export const updateBackgroundRects = (updatingArcs: D3Selection, centroid: any, visibility: string) => {
  updatingArcs.each(
    withD3Element((d: Datum, el: HTMLElement) => {
      const element: D3Selection = select(el);
      const textDimensions: any = (element.select("text").node() as any).getBBox();
      const transform: [number, number] = [
        centroid(d)[0] + textDimensions.x - RECT_PADDING,
        centroid(d)[1] + textDimensions.y - RECT_PADDING,
      ];

      element
        .select("rect")
        .attr("width", textDimensions.width + RECT_PADDING * 2)
        .attr("height", textDimensions.height + RECT_PADDING * 2)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("transform", translateString(transform))
        .attr("visibility", visibility);

      element.select("text").attr("visibility", visibility);
    }),
  );
};

export const updateTotal = (
  el: D3Selection,
  label: string,
  options: { maxTotalFontSize: number; minTotalFontSize: number; innerRadius: number; yOffset: string },
) => {
  const total = el
    .select(`g.${styles.total}`)
    .selectAll("text")
    .data([label]);

  total
    .exit()
    .style("font-size", "1px")
    .remove();

  const mergedTotal = total
    .enter()
    .append("svg:text")
    .attr("text-anchor", "middle")
    .merge(total)
    .text(String);

  const node = mergedTotal.node();
  if (node) {
    const y = stepFunction(mergedTotal, options.innerRadius);
    // start with min font size
    if (y(options.minTotalFontSize) < 0) {
      // Not enough room - do not show total
      total.data([]);
    } else {
      // change font size until bounding box is completely filled or max font size is reached
      mergedTotal.style(
        "font-size",
        Math.min(options.maxTotalFontSize, approxZero(y, options.minTotalFontSize)) + "px",
      );
      mergedTotal.attr("dy", options.yOffset);
    }
  }
};

export const computeTotal = (data: InputDatum[], valueAccessor: RendererAccessor<number>) =>
  reduce((memo: number, datum: InputDatum) => {
    const value = valueAccessor(datum);
    return memo + (value || 0);
  }, 0)(data);

export const computePercentages = (data: InputData, valueAccessor: RendererAccessor<number>, total: number) =>
  map((datum: InputDatum) => {
    datum.percentage = (valueAccessor(datum) / total) * 100;
    return datum as Datum;
  })(data);

export const layout = (valueAccessor: Accessor<any, number>, angleRange: [number, number]): Pie<any, any> =>
  d3Pie()
    .sort(null)
    .value(valueAccessor)
    .startAngle(angleRange[0])
    .endAngle(angleRange[1]);

export const removeArcTween = (computed: ComputedData, angleRange: [number, number]) => (d: ComputedDatum) => {
  const innerRadius = computed.rInner;
  const outerRadius = computed.r;
  const f = interpolateObject(
    { endAngle: d.endAngle, startAngle: d.startAngle },
    { innerRadius, outerRadius, endAngle: angleRange[1], startAngle: angleRange[1] },
  );
  return (t: number) => computed.arc(f(t));
};

export const updateFilteredPathAttributes = (selection: D3Selection, filterFunc: (d: Datum) => boolean, path: any) => {
  selection
    .filter(filterFunc)
    .select("path")
    .attr("d", path);
};
