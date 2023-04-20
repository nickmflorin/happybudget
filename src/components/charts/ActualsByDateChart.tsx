import { isNil } from "lodash";
import { ResponsiveBar } from "@nivo/bar";
import { BarTooltipProps } from "@nivo/bar/dist/types";

import { formatters, ui } from "lib";

import { Tooltip } from "./Tooltip";

export interface BudgetTotalChartProps<D extends ui.ChartDatum = ui.ChartDatum> {
  readonly data: D[];
  readonly tooltip?: (datum: BarTooltipProps<D>) => JSX.Element;
  readonly tooltipLabelPrefix?: (datum: BarTooltipProps<D>) => string;
}

export const ActualsByDateChart = <D extends ui.ChartDatum = ui.ChartDatum>(
  props: BudgetTotalChartProps<D>,
): JSX.Element => (
  <ResponsiveBar<D>
    data={props.data}
    margin={{ top: 20, right: 10, bottom: 22, left: 40 }}
    padding={0.8}
    colors={{ datum: "data.color" }}
    borderWidth={1}
    borderRadius={6}
    borderColor={{ from: "color" }}
    axisLeft={{
      tickValues: 6,
    }}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "country",
      legendPosition: "middle",
      legendOffset: 32,
    }}
    tooltip={(params: BarTooltipProps<D>): JSX.Element =>
      !isNil(props.tooltip) ? (
        props.tooltip(params)
      ) : (
        <Tooltip<D, formatters.Currency>
          labelPrefix={props.tooltipLabelPrefix?.(params)}
          label={params.indexValue}
          value={params.value}
          valueFormatter={formatters.currencyFormatter}
        />
      )
    }
    enableLabel={false}
    minValue={0}
    maxValue={1200}
  />
);
