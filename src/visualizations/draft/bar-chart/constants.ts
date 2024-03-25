import { BarChartProps } from "./VerticalBarChart/VerticalBarChart";
import {
  COMMON_ARG_TYPES,
  COMMON_CHART_DEFAULTS,
  DATA_DEFAULTS,
  INITIAL_DATA,
} from "../../constants";
import { StoryDatum } from "../../types";

export const CHART_DEFAULTS = {
  itemCount: INITIAL_DATA.length,
  maxValue: DATA_DEFAULTS.max,
  padding: 0.3,
  ...COMMON_CHART_DEFAULTS,
} as const satisfies Partial<BarChartProps<StoryDatum>>;

export const CHART_ARG_TYPES = {
  padding: {
    control: {
      type: "range",
      min: 0,
      max: 1,
      step: 0.1,
    },
  },
  ...COMMON_ARG_TYPES,
};
