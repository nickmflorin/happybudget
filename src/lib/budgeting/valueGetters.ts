import { filter, reduce, includes } from "lodash";
import * as tabling from "../tabling";
import * as businessLogic from "./businessLogic";
import * as models from "./models";

export const estimatedValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => {
  if (tabling.rows.isDataRow(row)) {
    return businessLogic.estimatedValue(row);
  } else {
    const childrenRows: Table.DataRow<R>[] = filter(
      rows,
      (r: Table.BodyRow<R>) => tabling.rows.isDataRow(r) && includes(row.children, r.id)
    ) as Table.DataRow<R>[];
    if (tabling.rows.isMarkupRow(row)) {
      /* Markup rows that are of unit FLAT only count towards the overall
			   estimated value once, not per Account/Sub Account that is tied to that
				 Markup (which happens when the Markup is of unit PERCENT). */
      if (row.markupData.unit.id === models.MarkupUnitModels.FLAT.id) {
        return row.markupData.rate || 0.0;
      }
      /* The Markup's estimated value is the sum of the contributions of each
			   child Row to that Markup.  Note that this is not simply the
				 `markup_contribution` of each Row, as that is the contribution of that
				 Row to the overall Markup, not solely this Markup. */
      return reduce(
        childrenRows,
        (curr: number, r: Table.DataRow<R>) =>
          curr +
          businessLogic.contributionFromMarkups(
            businessLogic.nominalValue(r) +
              businessLogic.accumulatedMarkupContribution(r) +
              businessLogic.accumulatedFringeContribution(r) +
              businessLogic.fringeContribution(r),
            [row]
          ),
        0.0
      );
    } else {
      return reduce(childrenRows, (curr: number, r: Table.DataRow<R>) => curr + businessLogic.estimatedValue(r), 0.0);
    }
  }
};

export const actualValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => {
  if (tabling.rows.isDataRow(row) || tabling.rows.isMarkupRow(row)) {
    return row.data.actual;
  } else {
    const childrenRows: Table.DataRow<R>[] = filter(
      rows,
      (r: Table.BodyRow<R>) => tabling.rows.isDataRow(r) && includes(row.children, r.id)
    ) as Table.DataRow<R>[];
    return reduce(childrenRows, (curr: number, r: Table.DataRow<R>) => curr + r.data.actual, 0.0);
  }
};

export const varianceValueGetter = <R extends Tables.BudgetRowData>(
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[]
): number => estimatedValueGetter(row, rows) - actualValueGetter(row, rows);
