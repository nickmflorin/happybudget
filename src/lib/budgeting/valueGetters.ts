import { filter, reduce, includes } from "lodash";
import { tabling, model } from "lib";
import * as businessLogic from "./businessLogic";

export const estimatedValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => {
  if (tabling.typeguards.isDataRow(row)) {
    return businessLogic.estimatedValue(row);
  } else {
    // Note: We do not have to exclude row's by ID because the primary Row here
    // is already a MarkupRow and we are only looking at the BodyRow(s).
    const childrenRows: Table.ModelRow<R>[] = filter(
      rows,
      (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(row.children, r.id)
    ) as Table.ModelRow<R>[];
    if (tabling.typeguards.isMarkupRow(row)) {
      /*
        The markup contribution of a given <ModelRow> (and thus the markup contribution from
        a given model) represents the overall contribution of each <Markup> on that model
        to the total value.  Here, we are concerned with the sum of the <Markup> contributions
        for a series of models where each contribution is only to the specific <Markup> represented
        by this <MarkupRow>.
        */
      return reduce(
        childrenRows,
        (curr: number, r: Table.ModelRow<R>) =>
          curr + model.businessLogic.contributionFromMarkups(r.data.nominal_value, [row]),
        0.0
      );
    } else {
      return reduce(childrenRows, (curr: number, r: Table.ModelRow<R>) => curr + businessLogic.estimatedValue(r), 0.0);
    }
  }
};

export const actualValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => {
  if (tabling.typeguards.isDataRow(row) || tabling.typeguards.isMarkupRow(row)) {
    return row.data.actual;
  } else {
    // Note: We do not have to exclude row's by ID because the primary Row here
    // is already a MarkupRow and we are only looking at the BodyRow(s).
    const childrenRows: Table.ModelRow<R>[] = filter(
      rows,
      (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(row.children, r.id)
    ) as Table.ModelRow<R>[];
    return reduce(childrenRows, (curr: number, r: Table.ModelRow<R>) => curr + r.data.actual, 0.0);
  }
};

export const varianceValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => {
  return estimatedValueGetter(row, rows) - actualValueGetter(row, rows);
};
