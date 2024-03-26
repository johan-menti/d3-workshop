import { ScatterPlotChartProps } from "./DensityPlot";
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
  ...COMMON_CHART_DEFAULTS,
  transitionDuration: 100,
} as const satisfies Partial<ScatterPlotChartProps<StoryDatum>>;

export const CHART_ARG_TYPES = {
  ...COMMON_ARG_TYPES,
  itemCount: {
    control: {
      type: "range",
      min: 1,
      max: 100,
      step: 1,
    },
  },
};
