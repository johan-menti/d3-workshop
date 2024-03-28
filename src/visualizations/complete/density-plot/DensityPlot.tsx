import { useEffect, useMemo, useRef, useState } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";
import { scaleLinear } from "d3-scale";
import {
  line,
  curveBasis,
  curveMonotoneX,
  curveBasisOpen,
  curveBasisClosed,
  curveBumpX,
  curveBumpY,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveNatural,
  curveStep,
  curveMonotoneY,
} from "d3-shape";
import { axisBottom } from "d3-axis";
import { animated, useSpring, easings, useSprings } from "react-spring";

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
  const GRADIENT_ID = "graph-gradient";

  const [hover, setHover] = useState(false);
  const [showCorrectArea, setShowCorrectArea] = useState(false);

  const correctRange = [4, 20] as const;

  const xScale = scaleLinear()
    .domain([0, maxValue])
    .range([0 + LABEL_PADDING, boundedWidth - LABEL_PADDING]);

  // const
  const [rangeStart, rangeEnd] = xScale.range();

  // Define the line generator
  const densityLine = line()
    // TODO: add curve as Storybook prop
    .curve(curveBumpX) // This makes the line smooth
    // TODO: curveBasis makes it look nice but flattens it too much
    // .curve(curveMonotoneX) is what we currently use but sometimes crashes
    // the React.spring animation:
    // Error: The arity of each "output" value must be equal
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  // const densityLineCorrect = line()
  //   .curve(curveBasis)
  //   .x((d) => xScale(d[0]))
  //   .y((d) => yScale(d[1]));

  const paddingStart: [tick: number, value: number] = [0, 0];
  const paddingEnd: [tick: number, value: number] = [maxValue, 0];
  const memoizedData = useMemo(
    () => formatData(data, xScale.ticks(bandwidth)),
    [data, xScale, bandwidth]
  );
  const formattedData: Array<[tick: number, value: number]> = [
    paddingStart, // Make sure the line starts at the bottom left corner
    ...memoizedData,
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

  // TODO: fix circle animations
  const circleAnimations = useSprings(
    memoizedData.length,
    memoizedData.map((d) => {
      // const [tick, value] = d;

      return {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
          // transform: `translate(${xScale(tick)}, ${yScale(value)})`,
        },
        config: {
          duration: 2000,
          easing: easings.easeOutBack,
        },
      };
    })
  );

  const verticalLine = line()
    .x((d) => d[0])
    .y((d) => yScale(d[1]));

  const correctAreaStartX = xScale(correctRange[0]);
  const correctAreaEndX = xScale(correctRange[1]);
  console.log("correctAreaStartX", correctAreaStartX);

  console.log("rangeStart", rangeStart);
  console.log("rangeEnd", rangeEnd);

  const startPercent = (correctAreaStartX - LABEL_PADDING + 3) / rangeEnd;
  const endPercent = (correctAreaEndX - LABEL_PADDING + 3 * 6) / rangeEnd;
  console.log("startPercent", startPercent);
  console.log("endPercent", endPercent);

  // const labelOffset = xScale(LABEL_PADDING)
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
        <defs>
          <linearGradient id="graph-gradient">
            <stop offset={0} stop-color={colors[0]}></stop>
            <stop offset={startPercent} stop-color={colors[0]}></stop>
            {showCorrectArea && (
              <>
                <stop offset={startPercent} stop-color="lightgreen"></stop>
                <stop offset={endPercent} stop-color="lightgreen"></stop>
              </>
            )}
            <stop offset={endPercent} stop-color={colors[0]}></stop>
            <stop offset={1} stop-color={colors[0]}></stop>
          </linearGradient>
        </defs>
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
          fill={`url(#${GRADIENT_ID})`}
          fillOpacity={0.2}
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={2}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setShowCorrectArea(!showCorrectArea)}
          {...animation}
        />
        {/* <path
          d={
            densityLine(getCorrectArea(formattedData, correctRange)) ||
            undefined
          }
          fill={"lightgreen"}
          fillOpacity={0.8}
          stroke={"lightgreen"}
          strokeWidth={3}
        ></path> */}
        {hover && (
          <g>
            {memoizedData.map(([tick, value], i) => {
              const spring = circleAnimations[i];
              return value > 0 ? (
                <animated.g key={i} {...spring}>
                  <animated.circle
                    stroke={colors[0]}
                    fill={colors[0]}
                    fillOpacity={0.2}
                    r={10}
                    cx={xScale(tick)}
                    cy={yScale(value)}
                    {...spring}
                  />
                  {/* TODO: remove title */}
                  <title>
                    {tick} ({value})
                  </title>
                  <text
                    x={xScale(tick)}
                    y={yScale(value)}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize="0.8rem"
                    // {...spring}
                  >
                    {value}
                  </text>
                </animated.g>
              ) : null;
            })}
          </g>
        )}
        {/* TODO: add correctArea icon+label */}
        {showCorrectArea && (
          <>
            <path
              d={
                verticalLine([
                  [correctAreaStartX, 0],
                  [
                    correctAreaStartX,
                    findYForX(correctRange[0], formattedData),
                  ],
                ]) || undefined
              }
              stroke="lightgreen"
            />
            <path
              d={
                verticalLine([
                  [correctAreaEndX, 0],
                  [correctAreaEndX, findYForX(correctRange[1], formattedData)],
                ]) || undefined
              }
              stroke="lightgreen"
            />
          </>
        )}
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

  // TODO: seems to rerender on hover, memo?
  console.log("result", result);
  return result as Array<[number, number]>;
}

// function getCorrectArea(
//   data: ReturnType<typeof formatData>,
//   correctRange: Readonly<[start: number, end: number]>
// ): ReturnType<typeof formatData> {
//   return data.filter(
//     ([tick]) => tick >= correctRange[0] && tick <= correctRange[1]
//   );
// }

function findYForX(
  x: number,
  data: Array<[number, number]>
): number | undefined {
  // console.log("data", data);
  // console.log("x", x);
  const point = data.find(([xPoint]) => xPoint === x);
  // console.log("point", point);
  return point ? point[1] : undefined;
}
