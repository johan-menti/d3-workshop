import type { Meta, StoryObj } from "@storybook/react";
import { PieChart as Chart, PieChartProps as ChartProps } from "./PieChart";
import { CHART_ARG_TYPES, CHART_DEFAULTS } from "./constants";
import { StoryDecorator } from "../../../stories/StoryDecorator";
import { StoryDatum } from "../../types";

const meta = {
  title: "Visualizations/Draft/Pie chart",
  component: Chart<StoryDatum>,
  argTypes: CHART_ARG_TYPES,
  decorators: [StoryDecorator as any],
} satisfies Meta<typeof Chart<StoryDatum>>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialProps = {
  ...CHART_DEFAULTS,
} satisfies ChartProps<StoryDatum>;

export const Primary: Story = {
  args: {
    ...initialProps,
  },
};
