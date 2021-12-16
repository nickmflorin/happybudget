import { ResponsiveBar } from "@nivo/bar";
import { BarTooltipProps } from "@nivo/bar/dist/types";
import { isNil } from "lodash";

import { tabling } from "lib";

import Tooltip from "./Tooltip";

interface BudgetTotalChartProps<D extends Charts.Datum = Charts.Datum> {
  readonly data: D[];
  readonly tooltip?: (datum: BarTooltipProps<D>) => JSX.Element;
  readonly tooltipLabelPrefix?: (datum: BarTooltipProps<D>) => string;
}

const ActualsByDateChart = <D extends Charts.Datum = Charts.Datum>(props: BudgetTotalChartProps<D>): JSX.Element => {
  return (
    <ResponsiveBar<D>
      data={props.data}
      margin={{ top: 20, right: 10, bottom: 22, left: 40 }}
      padding={0.8}
      colors={{ datum: "data.color" }}
      borderWidth={1}
      borderRadius={6}
      borderColor={{ from: "color" }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "country",
        legendPosition: "middle",
        legendOffset: 32
      }}
      tooltip={(params: BarTooltipProps<D>): JSX.Element => {
        return !isNil(props.tooltip) ? (
          props.tooltip(params)
        ) : (
          <Tooltip<BarTooltipProps<D>>
            labelPrefix={props.tooltipLabelPrefix?.(params)}
            label={params.indexValue}
            value={params.value}
            valueFormatter={(v: string | number) => tabling.formatters.currencyValueFormatter(v)}
          />
        );
      }}
    />
  );
};

export default ActualsByDateChart;
