import { useRef } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { VerticalAxis } from "../bar-chart/Axes/VerticalAxis";
import { HorizontalAxis } from "../bar-chart/Axes/HorizontalAxis";
import { animated, useSprings } from "react-spring";

export interface DensityPlotProps<Datum> extends Chart<Datum> {
  data: Array<Datum>;
}

export function DensityPlot<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  maxValue = CHART_DEFAULTS.maxValue,
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
}: DensityPlotProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundedWidth = rootWidth - marginRight - marginLeft;
  const boundedHeight = rootHeight - marginTop - marginBottom;

  // Scales
  const yScale = scaleLinear().domain([0, maxValue]).range([boundedHeight, 0]);
  const xScale = scaleLinear().domain([0, maxValue]).range([0, boundedWidth]);
  const colorScale = scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(colors);
  const horizontalAxisTransform = `translate(0, ${boundedHeight})`;

  const springs = useSprings(
    data.length,
    data.map(() => {
      return {
        from: {
          fillOpacity: 0,
        },
        to: {
          fillOpacity: 0.5,
        },
        config: {
          duration: transitionDuration,
        },
      };
    })
  );


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
    >
      <g
        width={boundedWidth}
        height={boundedHeight}
        transform={`translate(${marginLeft}, ${marginTop})`}
      >
        <VerticalAxis
          data-name="linear-axis"
          tickScale={yScale}
          items={yScale.ticks()}
          range={yScale.range()}
          gridWidth={boundedWidth}
        />

        <HorizontalAxis
          data-name="discrete-axis"
          tickScale={xScale}
          transform={horizontalAxisTransform}
          items={xScale.ticks()}
          range={xScale.range()}
          gridHeight={boundedHeight}
        />

        {/* Circles */}
        {data.map((d, i) => {
          return (
            <g key={i}>
              <animated.circle
                r={13}
                cx={xScale(d.value)}
                cy={yScale(d.goal)}
                stroke={colorScale(d.label)}
                fill={colorScale(d.label)}
                opacity={1}
                strokeWidth={1}
                {...springs[i]}
              />
              <title>
                {d.label} ({d.value})
              </title>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
