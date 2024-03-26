import { useEffect, useMemo, useRef } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";
import { scaleLinear } from "d3-scale";
import { line, curveBasis, curveMonotoneX } from "d3-shape";
import { axisBottom } from "d3-axis";

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
  bandwidth = 20,
  // transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
}: DensityPlotProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundedWidth = rootWidth - marginRight - marginLeft;
  const boundedHeight = rootHeight - marginTop - marginBottom;

  // Scales
  const xScale = scaleLinear().domain([0, maxValue]).range([0, boundedWidth]);
  console.log(xScale.ticks());
  const yScale = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.goal as number), 1)])
    .range([boundedHeight / 2, 0]);

  const [rangeStart, rangeEnd] = xScale.range();

  useEffect(() => {
    console.log("bandwidth",bandwidth);
    console.log('data', data);
  }, [bandwidth, data]);

  // Define the line generator
  const densityLine = line()
    .curve(curveMonotoneX) // This makes the line smooth
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  console.log("x", xScale.ticks());
  console.log("y", yScale.ticks());
  // const mockData: [number, number][] = [[0, 0], [5, 2]];

  const mockData: [number, number][] = data
    .map((d) => [d.value as number, d.goal as number])
    .sort((a, b) => a[0] - b[0]);

  console.log(mockData);

  // console.log(densityLine(data.map((d) => [d.goal, d.value]));
  console.log(densityLine(mockData));
  const LABEL_PADDING = 30;
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
        {/* <rect width={boundedWidth} height={boundedHeight} fill="red" /> */}

        {/* Mock y axis */}
        <line
          stroke="currentColor"
          strokeWidth={1}
          y1={yScale.range()[0]}
          y2={yScale.range()[1]}
        />
        {/* Main axis */}
        <g
          data-name="horizontal-axis"
          transform={`translate(0,${boundedHeight / 2})`}
        >
          <text
            fill="currentColor"
            x={LABEL_PADDING - 20}
            alignmentBaseline="central"
          >
            0
          </text>
          <line
            stroke="currentColor"
            strokeWidth={1}
            x1={rangeStart + LABEL_PADDING}
            x2={rangeEnd - LABEL_PADDING}
          />
          <text
            fill="currentColor"
            x={rangeEnd - LABEL_PADDING + 10}
            alignmentBaseline="central"
          >
            {maxValue}
          </text>
        </g>
        {/* TODO: Add density plot here */}
        {/* Density plot line */}
        <path
          // d={densityLine(data.map(d => [d.goal, d.value]))} // Cast to the expected tuple type
          d={densityLine(mockData) || undefined}
          fill="none"
          fillOpacity={0.2}
          stroke="steelblue"
          strokeWidth={2}
        />
      </g>
    </svg>
  );
}
