declare namespace Charts {
  declare namespace Pie {
    type Datum = {
      readonly color: string;
      readonly value: number;
      readonly label: import("@nivo/pie/dist/types").DatumId;
      readonly id: import("@nivo/pie/dist/types").DatumId;
    };
  }

  declare namespace BudgetTotal {
    type MetricId = "estimated" | "actual" | "variance";

    type Metric = {
      readonly label: string;
      readonly id: MetricId;
      readonly getValue: (obj: M, objs: Model.Account[]) => number;
    };
  }
}
