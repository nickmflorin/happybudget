declare namespace Charts {
  type Datum = {
    readonly color: string;
    readonly value: number;
    readonly label: import("@nivo/pie/dist/types").DatumId;
    readonly id: import("@nivo/pie/dist/types").DatumId;
  };

  type ComputedDatum<D extends Datum> = import("@nivo/pie/dist/types").ComputedDatum<D>;

  namespace BudgetTotal {
    type MetricId = "estimated" | "actual" | "variance";

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    type Metric<M = any> = {
      readonly label: string;
      readonly id: MetricId;
      readonly getValue: (obj: M, objs: Model.Account[]) => number;
    };
  }
}
