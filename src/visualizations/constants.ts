import { schemeTableau10 } from "d3-scale-chromatic";
import { Chart, StoryDatum } from "./types";
import { colorPalette } from "./utils/color-palettes";

export const INITIAL_DATA = [
  { label: "ghost", value: 16, goal: 30 },
  { label: "jalapeño", value: 41, goal: 22 },
  { label: "habanero", value: 24, goal: 19 },
  { label: "bell", value: 50, goal: 50 },
  { label: "scotch", value: 20, goal: 45 },
];

export const DATA_DEFAULTS = {
  count: INITIAL_DATA.length,
  min: 0,
  max: 50,
} as const;

export const COMMON_CHART_DEFAULTS = {
  colorScheme: "tableau 10",
  colors: schemeTableau10,
  marginTop: 30,
  marginRight: 30,
  marginBottom: 40,
  marginLeft: 45,
  transitionDuration: 100,
  data: INITIAL_DATA,
  labelAccessor: (d) => d.label,
  valueAccessor: (d) => d.value,
} as const satisfies Partial<Chart<StoryDatum>>;

export const COMMON_ARG_TYPES = {
  colorScheme: {
    control: "inline-radio",
    options: Object.keys(colorPalette),
  },
  itemCount: {
    control: {
      min: 1,
      max: 10,
      step: 1,
    },
  },
  maxValue: {
    control: {
      type: "range",
      min: 1,
      max: 100,
      step: 1,
    },
  },
  transitionDuration: {
    control: {
      min: 1,
      max: 3000,
      step: 1,
    },
  },
  colors: { table: { disable: true } },
  labelAccessor: { table: { disable: true } },
  valueAccessor: { table: { disable: true } },
  data: { table: { disable: true } },
};
