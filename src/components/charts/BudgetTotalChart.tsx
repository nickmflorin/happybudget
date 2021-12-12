import { ResponsivePie } from "@nivo/pie";

interface BudgetTotalChartProps {
  readonly data: Charts.Pie.Datum[];
}

const BudgetTotalChart = (props: BudgetTotalChartProps): JSX.Element => {
  return (
    <ResponsivePie<Charts.Pie.Datum>
      data={props.data}
      margin={{ top: 10, right: -230, bottom: 10, left: 30 }}
      innerRadius={0.92}
      activeOuterRadiusOffset={8}
      colors={{ datum: "data.color" }}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      enableArcLinkLabels={false}
      enableArcLabels={false}
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
          itemDirection: "left-to-right"
        }
      ]}
      tooltip={(params: { datum: Charts.Pie.Datum }) => (
        <div
          style={{
            padding: 12,
            background: params.datum.color,
            borderRadius: "8px"
          }}
        >
          <strong>
            {params.datum.label}
            {": "}
            {params.datum.value}
          </strong>
        </div>
      )}
      theme={{
        tooltip: {
          container: {
            background: "#333"
          }
        }
      }}
    />
  );
};

export default BudgetTotalChart;
