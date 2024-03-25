import type { Meta, StoryObj } from "@storybook/react";
import { BarChart as Chart, BarChartProps as ChartProps } from "./MergedBarChart";
import { CHART_ARG_TYPES, CHART_DEFAULTS } from "../constants";
import { StoryDecorator } from "../../../../stories/StoryDecorator";
import { StoryDatum } from "../../../types";

const meta = {
  title: "Visualizations/Complete/Bar chart",
  component: Chart<StoryDatum>,
  argTypes: CHART_ARG_TYPES,
  decorators: [StoryDecorator as any],
} satisfies Meta<typeof Chart<StoryDatum>>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialProps = {
  orientation: "vertical",
  ...CHART_DEFAULTS,
} satisfies ChartProps<StoryDatum>;

export const Merged: Story = {
  args: {
    ...initialProps,
  },
};
