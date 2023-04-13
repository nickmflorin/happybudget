import { DatumId, ComputedDatum as RootComputedDatum } from "@nivo/pie/dist/types";

import * as model from "../../model";

export type Datum = {
  readonly color: string;
  readonly value: number;
  readonly label: DatumId;
  readonly id: DatumId;
};

export type ComputedDatum<D extends Datum> = RootComputedDatum<D>;

export type BudgetTotalMetricId = "estimated" | "actual" | "variance";

export type BudgetTotalMetric<M> = {
  readonly label: string;
  readonly id: BudgetTotalMetricId;
  readonly getValue: (obj: M, objs: model.Account[]) => number;
};
