import { useRef } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";

export interface ScatterPlotChartProps<Datum> extends Chart<Datum> {
  data: Array<Datum>;
}

export function ScatterPlotChart<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  maxValue = CHART_DEFAULTS.maxValue,
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
}: ScatterPlotChartProps<Datum>) {
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
