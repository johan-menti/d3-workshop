import { useRef } from "react";
import "../BarChart.css";
import { CHART_DEFAULTS } from "../constants";
import { useDimensions } from "../../../utils/use-dimensions";
import { Chart } from "../../../types";

export interface BarChartProps<Datum> extends Chart<Datum> {
  /**
   * Sets both the inner and outer padding to the band.
   * The value ranges between 0 and 1.
   * @see https://d3js.org/d3-scale/band#band_padding
   */
  padding?: number;
}

export function BarChart<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  padding = CHART_DEFAULTS.padding,
  colors = [],
  data = [],
  labelAccessor,
  valueAccessor,
}: BarChartProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);

  return (
    <svg
      ref={ref}
      width={rootWidth}
      height={rootHeight}
      style={{
        width: "100%",
        height: "100%",
        border: "1px dashed lightgray",
        borderRadius: 5,
        fontFamily: '"Nunito Sans"',
      }}
    ></svg>
  );
}
