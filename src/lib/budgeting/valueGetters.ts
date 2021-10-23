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
      // Markup rows that are of unit FLAT only count towards the overall estimated value once,
      // not per Account/Sub Account that is tied to that Markup (which happens when the Markup
      // is of unit PERCENT).
      if (row.markupData.unit.id === model.models.MarkupUnitModels.FLAT.id) {
        return row.markupData.rate || 0.0;
      }
      return reduce(childrenRows, (curr: number, r: Table.ModelRow<R>) => curr + r.data.markup_contribution, 0.0);
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
