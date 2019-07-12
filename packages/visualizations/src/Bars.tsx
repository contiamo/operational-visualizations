import React from "react";
import { useChartTransform } from "./Chart";
import { AxialChart } from "./types";
import { getStyleProp } from "./utils";

export const Bars: AxialChart<string> = React.memo(props => {
  const defaultTransform = useChartTransform();
  const styleProp = getStyleProp(props.style);

  if (props.metricDirection === "vertical") {
    const {
      data,
      transform,
      metric,
      categorical,
      metricScale,
      categoricalScale
    } = props;
    const height = metricScale(metricScale.domain()[0]);

    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            x={categoricalScale(categorical(row))}
            y={metricScale(metric(row))}
            width={categoricalScale.bandwidth()}
            height={height - metricScale(metric(row))}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  } else {
    const {
      data,
      transform,
      metric,
      categorical,
      metricScale,
      categoricalScale
    } = props;
    return (
      <g transform={transform || defaultTransform}>
        {data.mapRows((row, i) => (
          <rect
            y={categoricalScale(categorical(row))}
            x={0}
            height={categoricalScale.bandwidth()}
            width={metricScale(metric(row))}
            style={styleProp.isFunction ? styleProp.style(i) : styleProp.style}
            key={i}
          />
        ))}
      </g>
    );
  }
});
