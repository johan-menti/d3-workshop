import { useRef } from "react";
import "../BarChart.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { CHART_DEFAULTS } from "../constants";
import { useDimensions } from "../../../utils/use-dimensions";
import { Chart } from "../../../types";
import { Axis } from "./Axis";
import { Bars } from "./Bars";

export interface BarChartProps<Datum> extends Chart<Datum> {
  orientation: "horizontal" | "vertical";
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
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  padding = CHART_DEFAULTS.padding,
  colors = [],
  data = [],
  orientation,
  labelAccessor,
  valueAccessor,
}: BarChartProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundedWidth = rootWidth - marginRight - marginLeft;
  const boundedHeight = rootHeight - marginTop - marginBottom;

  /**
   * A discrete function would have values that stand alone,
   * but not have an interval around them.
   * @see https://d3js.org/d3-scale/band
   */
  const discreteValues = data.map(labelAccessor);
  const discreteScale = scaleBand().domain(discreteValues).padding(padding);
  const linearScale = scaleLinear().domain([0, Math.max(...data.map(valueAccessor))]);
  let discreteAxisTransform: string | undefined = undefined;
  let linearAxisTransform: string | undefined = undefined;

  if (orientation === "horizontal") {
    discreteScale.range([boundedHeight, 0]);
    linearScale.range([0, boundedWidth]);
    linearAxisTransform = `translate(0, ${boundedHeight})`;
  } else {
    discreteScale.range([0, boundedWidth]);
    linearScale.range([boundedHeight, 0]);
    discreteAxisTransform = `translate(0, ${boundedHeight})`;
  }

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
        fontFamily: '"Nunito Sans","Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <g
        data-name="bounds"
        width={boundedWidth}
        height={boundedHeight}
        transform={`translate(${marginLeft}, ${marginTop})`}
        fontSize="14"
      >
        <Axis
          data-name="discrete-axis"
          tickScale={discreteScale}
          orientation={orientation}
          transform={discreteAxisTransform}
          items={discreteScale.domain()}
          range={discreteScale.range()}
          tickPadding={discreteScale.bandwidth() / 2}
          transitionDuration={transitionDuration}
        />

        <Axis
          data-name="linear-axis"
          tickScale={linearScale}
          orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
          transform={linearAxisTransform}
          items={linearScale.ticks()}
          range={linearScale.range()}
          transitionDuration={transitionDuration}
        />

        {rootHeight && (
          <Bars
            data={data}
            height={boundedHeight}
            orientation={orientation}
            linearScale={linearScale}
            discreteScale={discreteScale}
            colors={colors}
            labelAccessor={labelAccessor}
            valueAccessor={valueAccessor}
            transitionDuration={transitionDuration}
          />
        )}
      </g>
    </svg>
  );
}
