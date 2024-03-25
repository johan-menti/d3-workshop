import { ScaleBand, ScaleLinear, scaleOrdinal } from "d3-scale";
import { useSprings, animated } from "react-spring";
import { BarChartProps } from "./VerticalBarChart";

interface BarsProps<Datum>
  extends Pick<
    BarChartProps<Datum>,
    "data" | "labelAccessor" | "valueAccessor" | "colors" | "transitionDuration"
  > {
  height: number;
  discreteScale: ScaleBand<string>;
  linearScale: ScaleLinear<number, number>;
}

export function VerticalBars<Datum>({
  data,
  labelAccessor,
  valueAccessor,
  height: boundedHeight,
  discreteScale,
  linearScale,
  colors,
  transitionDuration,
}: BarsProps<Datum>) {
  const getBandColor = scaleOrdinal(colors).domain(discreteScale.domain());

  const springs = useSprings(
    data.length,
    data.map((d) => {
      const label = labelAccessor(d);
      const value = valueAccessor(d);

      const { width, height, x, y } = {
        x: discreteScale(label),
        y: linearScale(value),
        width: discreteScale.bandwidth(),
        height: boundedHeight - linearScale(value),
      };

      return {
        to: {
          width,
          x,
          y,
          height,
        },
        config: {
          duration: transitionDuration,
        },
      };
    })
  );

  return (
    <g data-name="bars">
      {data.map((d, i) => {
        const label = labelAccessor(d);
        const value = valueAccessor(d);
        const bandColor = getBandColor(label);
        const style = springs[i];

        return (
          <g className="bar" data-value={value} key={label}>
            <animated.rect fill={bandColor} rx="5" ry="5" {...style} />
            <title>{value}</title>
          </g>
        );
      })}
    </g>
  );
}
