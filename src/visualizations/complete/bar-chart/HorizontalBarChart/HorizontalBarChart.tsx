import { useRef } from "react";
import "../BarChart.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { CHART_DEFAULTS } from "../constants";
import { useDimensions } from "../../../utils/use-dimensions";
import { Chart } from "../../../types";
import { HorizontalAxis } from "../Axes/HorizontalAxis";
import { VerticalAxis } from "../Axes/VerticalAxis";
import { HorizontalBars } from "./HorizontalBars";

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
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
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
  const discreteScale = scaleBand()
    .domain(discreteValues)
    .padding(padding)
    .range([boundedHeight, 0]);
  const linearScale = scaleLinear()
    .domain([0, Math.max(...data.map(valueAccessor))])
    .range([0, boundedWidth]);
  const discreteAxisTransform: string | undefined = undefined;
  const linearAxisTransform = `translate(0, ${boundedHeight})`;

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
        {rootHeight && (
          <HorizontalBars
            data={data}
            height={boundedHeight}
            linearScale={linearScale}
            discreteScale={discreteScale}
            colors={colors}
            labelAccessor={labelAccessor}
            valueAccessor={valueAccessor}
            transitionDuration={transitionDuration}
          />
        )}

        <VerticalAxis
          data-name="discrete-axis"
          tickScale={discreteScale}
          transform={discreteAxisTransform}
          items={discreteScale.domain()}
          range={discreteScale.range()}
          tickPadding={discreteScale.bandwidth() / 2}
          transitionDuration={transitionDuration}
        />

        <HorizontalAxis
          data-name="linear-axis"
          tickScale={linearScale}
          transform={linearAxisTransform}
          items={linearScale.ticks()}
          range={linearScale.range()}
          transitionDuration={transitionDuration}
        />
      </g>
    </svg>
  );
}
