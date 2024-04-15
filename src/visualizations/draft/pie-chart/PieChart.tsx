import { useRef } from "react";
import { Chart } from "../../types";
import { CHART_DEFAULTS } from "./constants";
import { useDimensions } from "../../utils/use-dimensions";
import { pie, arc } from "d3-shape";
import { scaleOrdinal } from "d3-scale";
import { animated, useSprings } from "react-spring";

export interface PieChartProps<Datum> extends Chart<Datum> {
  innerRadius?: number;
  padAngle?: number;
  data: Array<Datum>;
}

export function PieChart<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  colors = [],
  data = [],
  innerRadius = CHART_DEFAULTS.innerRadius,
  padAngle = CHART_DEFAULTS.padAngle,
  valueAccessor,
  labelAccessor,
}: PieChartProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);

  const boundedWidth = rootWidth - marginRight - marginLeft;
  const boundedHeight = rootHeight - marginTop - marginBottom;
  const radius = Math.min(boundedWidth, boundedHeight) / 2;

  const LEGEND_MARGIN = 50;
  const LEGEND_CIRCLE_RADIUS = 10;
  const LEGEND_CIRCLE_SPACE = 25;
  const LEGEND_LINE_HEIGHT = 20;
  const LEGEND_TEXT_WIDTH = 50;

  const pieGenerator = pie<Datum>().value(valueAccessor);
  const pieAnglesDataset = pieGenerator(data);

  const arcPathGenerator = arc();
  const arcPaths = pieAnglesDataset
    .map((p) => {
      const arcInfo = {
        innerRadius: radius * innerRadius,
        outerRadius: radius - LEGEND_MARGIN - LEGEND_CIRCLE_SPACE,
        ...p,
      };

      const arcPath = arcPathGenerator(arcInfo);
      if (!arcPath) {
        return null;
      }

      const centeroid = arcPathGenerator.centroid(arcInfo);
      const legendInfo = {
        innerRadius: 0,
        outerRadius: radius * 2 - LEGEND_CIRCLE_SPACE,
        startAngle: p.startAngle,
        endAngle: p.endAngle,
      };
      const legendCeneteroid = arcPathGenerator.centroid(legendInfo);

      const legendTextInfo = {
        innerRadius: 0,
        outerRadius: radius * 2 - LEGEND_CIRCLE_SPACE + 60,
        startAngle: p.startAngle,
        endAngle: p.endAngle,
      };
      const legendTextCeneteroid = arcPathGenerator.centroid(legendTextInfo);
      return {
        arcInfo,
        arcPath,
        centeroid,
        legendCeneteroid,
        legendTextCeneteroid,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const getArcColor = scaleOrdinal<string>(colors).domain(
    arcPaths.map((d) => d.arcPath)
  );

  const springs = useSprings(
    arcPaths.length,
    arcPaths.map((d) => ({
      from: {
        opacity: 0,
        transform: "translate(0,0)",
      },
      to: {
        path: d.arcPath,
        angles: [d.arcInfo.startAngle, d.arcInfo.endAngle],
        legendX: d.legendCeneteroid[0],
        legendY: d.legendCeneteroid[1],
        labelPosX:
          d.legendCeneteroid[0] + 20 * (d.legendCeneteroid[0] > 0 ? 1 : -1),
        opacity: 1,
        transform:
          arcPaths.length === 1
            ? "translate(0,0)"
            : `translate(${d.centeroid[0]}, ${d.centeroid[1]})`,
      },
    }))
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
        data-name="bounds"
        width={boundedWidth}
        height={boundedHeight}
        transform={`translate(${marginLeft}, ${marginTop})`}
      >
        <g
          data-name="pie-chart"
          transform={`translate(${boundedWidth / 2}, ${boundedHeight / 2})`}
        >
          {arcPaths.map(
            ({ arcInfo, arcPath, centeroid, legendCeneteroid }, i) => {
              const color = getArcColor(arcPath);
              const label = labelAccessor(arcInfo.data);
              const value = valueAccessor(arcInfo.data);

              const isRightLabel = legendCeneteroid[0] > 0;
              const labelPosX =
                legendCeneteroid[0] + 20 * (isRightLabel ? 1 : -1);
              const textAnchor = isRightLabel ? "start" : "end";

              const spring = springs[i];

              const animatedAnglesPath = spring.angles.to(
                (startAngle, endAngle) => {
                  return arcPathGenerator({
                    ...arcInfo,
                    startAngle,
                    endAngle,
                  });
                }
              );

              return (
                <g key={i}>
                  <title>{label}</title>
                  <animated.path
                    // d={spring.path}
                    d={animatedAnglesPath}
                    fill={color}
                  />

                  <animated.line
                    x1={centeroid[0]}
                    y1={centeroid[1]}
                    x2={spring.legendX}
                    y2={spring.legendY}
                    fill={color}
                    stroke={color}
                  />

                  <animated.circle
                    cx={spring.legendX}
                    cy={spring.legendY}
                    r={LEGEND_CIRCLE_RADIUS}
                    fill={color}
                  />
                  <animated.text
                    // x={centeroid[0]}
                    // y={centeroid[1]}
                    opacity={spring?.opacity ?? 0}
                    x={0}
                    y={0}
                    textAnchor="middle"
                    transform={spring?.transform ?? undefined}
                    dy={arcPaths.length === 1 ? "0.35em" : undefined}
                    fill="white"
                  >
                    {value}
                  </animated.text>
                  <animated.text
                    x={labelPosX}
                    y={spring.legendY}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                  >
                    {label}
                  </animated.text>

                  {/* <foreignObject
                    x={labelPosX}
                    y={legendCeneteroid[1] - LEGEND_LINE_HEIGHT}
                    textAnchor={textAnchor}
                    width="100"
                    height="30"
                    overflow={"visible"}
                    // style={{
                    //   transform: `translateX(${100 * (isRightLabel ? 1 : -1)}px)`,
                    // }}
                  >
                    <span
                      style={{
                        textAlign: isRightLabel ? "end" : "start",
                        wordWrap: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {label} sjkd akj daskj sdakj dsakj kadjs
                      daksdkjajskjsakjsakjsajkjsakakj
                    </span>
                  </foreignObject> */}
                </g>
              );
            }
          )}
        </g>
      </g>
    </svg>
  );
}
