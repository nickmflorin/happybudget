import { isNil } from "lodash";
import { ResponsivePie } from "@nivo/pie";

import { formatters } from "lib";

import Tooltip from "./Tooltip";

interface BudgetTotalChartProps<D extends Charts.Datum = Charts.Datum> {
  readonly data: D[];
  readonly tooltip?: (datum: Charts.ComputedDatum<D>) => JSX.Element;
  readonly tooltipLabelPrefix?: (datum: Charts.ComputedDatum<D>) => string;
}

const BudgetTotalChart = <D extends Charts.Datum = Charts.Datum>(
  props: BudgetTotalChartProps<D>,
): JSX.Element => (
  <ResponsivePie<D>
    data={props.data}
    margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
    innerRadius={0.92}
    activeOuterRadiusOffset={8}
    colors={{ datum: "data.color" }}
    borderWidth={1}
    borderColor={{ from: "color" }}
    enableArcLinkLabels={false}
    enableArcLabels={false}
    valueFormat="<$.2~s"
    legends={[
      {
        anchor: "left",
        direction: "column",
        justify: false,
        translateX: 0,
        translateY: 0,
        itemWidth: 100,
        itemHeight: 20,
        itemsSpacing: 23,
        symbolSize: 10,
        itemDirection: "left-to-right",
      },
    ]}
    tooltip={(params: { datum: Charts.ComputedDatum<D> }): JSX.Element =>
      !isNil(props.tooltip) ? (
        props.tooltip(params.datum)
      ) : (
        <Tooltip<Charts.ComputedDatum<D>>
          labelPrefix={props.tooltipLabelPrefix?.(params.datum)}
          datum={params.datum}
          valueFormatter={formatters.currencyFormatter}
        />
      )
    }
  />
);

export default BudgetTotalChart;
