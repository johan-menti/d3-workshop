import { useEffect, useMemo, useRef } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";
import { scaleLinear } from "d3-scale";
import { line, curveBasis, curveMonotoneX } from "d3-shape";
import { axisBottom } from "d3-axis";
import { animated, useSpring, easings } from "react-spring";

export interface DensityPlotProps<Datum> extends Chart<Datum> {
  data: Array<Datum>;
  bandwidth: number;
}

/*
 * A density plot shows the distribution of a numeric variable.
 * In the following examples, a kernel density estimation is always used.
 * The result can then be plotted using the d3.line() function.
 */
export function DensityPlot<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  maxValue = CHART_DEFAULTS.maxValue,
  bandwidth = 10,
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
}: DensityPlotProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundedWidth = rootWidth - marginRight - marginLeft;
  const boundedHeight = rootHeight - marginTop - marginBottom;

  const LABEL_PADDING = 30;

  // Scales
  const xScale = scaleLinear()
    .domain([0, maxValue])
    .range([0 + LABEL_PADDING, boundedWidth - LABEL_PADDING]);

  const [rangeStart, rangeEnd] = xScale.range();

  // Define the line generator
  const densityLine = line()
    .curve(curveBasis) // This makes the line smooth
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  const paddingStart: [tick: number, value: number] = [0, 0];
  const paddingEnd: [tick: number, value: number] = [maxValue, 0];
  const formattedData: Array<[tick: number, value: number]> = [
    paddingStart, // Make sure the line starts at the bottom left corner
    ...formatData(data, xScale.ticks(bandwidth)),
    paddingEnd, // Make sure the line ends at the bottom right corner
  ];

  const yScale = scaleLinear()
    .domain([0, Math.max(...formattedData.map((d) => d[1]), 1)])
    .range([boundedHeight / 2, 0]);

  const animation = useSpring({
    to: { d: densityLine(formattedData) || undefined },
    config: {
      duration: transitionDuration,
      easing: easings.easeOutBack,
    },
  });

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
        alignmentBaseline="middle"
      >
        <g
          data-name="horizontal-axis"
          transform={`translate(0,${boundedHeight / 2})`}
        >
          <text fill="currentColor" x={10} alignmentBaseline="central">
            0
          </text>
          <line
            stroke="currentColor"
            strokeWidth={1}
            x1={rangeStart}
            x2={rangeEnd}
          />
          <text
            fill="currentColor"
            x={rangeEnd + 10}
            alignmentBaseline="central"
          >
            {maxValue}
          </text>
        </g>
        {/* Density plot line */}
        <animated.path
          fill={colors[0]}
          fillOpacity={0.2}
          stroke={colors[0]}
          strokeWidth={2}
          {...animation}
        />
      </g>
    </svg>
  );
}

function formatData(
  data: Array<any>,
  ticks: number[]
): Array<[number, number]> {
  // console.log("formatticks", ticks);
  const result = ticks.map((tick) => {
    const values = data.map((d) => d.value as number);
    const count = values.filter((value) => value === tick).length;
    return [tick, count];
  });

  console.log("result", result);
  return result as Array<[number, number]>;
}
