declare namespace Charts {
  type Datum = {
    readonly color: string;
    readonly value: number;
    readonly label: import("@nivo/pie/dist/types").DatumId;
    readonly id: import("@nivo/pie/dist/types").DatumId;
  };

  type ComputedDatum<D extends Datum> = import("@nivo/pie/dist/types").ComputedDatum<D>;

  declare namespace BudgetTotal {
    type MetricId = "estimated" | "actual" | "variance";

    type Metric = {
      readonly label: string;
      readonly id: MetricId;
      readonly getValue: (obj: M, objs: Model.Account[]) => number;
    };
  }
}
