import { isNil, reduce, filter } from "lodash";

import { tabling } from "lib";
import * as models from "./models";
import * as typeguards from "./typeguards";

type WithActual<R extends Tables.BudgetRowData> =
  | Table.DataRow<R>
  | Model.Account
  | Model.SubAccount
  | Model.PdfAccount
  | Model.PdfSubAccount
  | Model.Budget
  | Model.PdfBudget
  | Model.Template;

type WithEstimation<R extends Tables.BudgetRowData> = WithActual<R> | Model.Template;

export const nominalValue = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(obj: WithEstimation<R>) =>
  tabling.typeguards.isRow(obj) ? obj.data.nominal_value : obj.nominal_value;

export const accumulatedMarkupContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(
  obj: WithEstimation<R>
) => (tabling.typeguards.isRow(obj) ? obj.data.accumulated_markup_contribution : obj.accumulated_markup_contribution);

export const accumulatedFringeContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(
  obj: WithEstimation<R>
) => (tabling.typeguards.isRow(obj) ? obj.data.accumulated_fringe_contribution : obj.accumulated_fringe_contribution);

/* eslint-disable indent */
export const fringeContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(obj: WithEstimation<R>) =>
  // Only SubAccount(s) have a Fringe Contribution.
  tabling.typeguards.isRow(obj) && typeguards.isSubAccountRow(obj)
    ? obj.data.fringe_contribution
    : !tabling.typeguards.isRow(obj) && (typeguards.isSubAccount(obj) || typeguards.isPdfSubAccount(obj))
    ? obj.fringe_contribution
    : 0.0;

export const estimatedValue = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(m: WithEstimation<R>): number => {
  return nominalValue(m) + accumulatedMarkupContribution(m) + accumulatedFringeContribution(m) + fringeContribution(m);
};

export const actualValue = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(obj: WithActual<R>): number =>
  tabling.typeguards.isRow(obj) ? obj.data.actual : obj.actual;

export const varianceValue = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(m: WithActual<R>): number =>
  estimatedValue(m) - actualValue(m);

export const contributionFromMarkups = <R extends Table.RowData = Tables.BudgetRowData>(
  value: number,
  markups: (Model.Markup | Table.MarkupRow<R>)[]
): number => {
  const unit = (m: Model.Markup | Table.MarkupRow<R>) => (tabling.typeguards.isRow(m) ? m.markupData.unit : m.unit);
  return reduce(
    filter(markups, (m: Model.Markup | Table.MarkupRow<R>) => unit(m).id === models.MarkupUnitModels.PERCENT.id),
    (curr: number, markup: Model.Markup | Table.MarkupRow<R>): number => {
      const rate = tabling.typeguards.isRow(markup) ? markup.markupData.rate : markup.rate;
      if (!isNil(rate)) {
        return curr + rate * value;
      }
      return curr;
    },
    0.0
  );
};

export const contributionFromFringes = (value: number, fringes: (Model.Fringe | Tables.FringeRow)[]): number => {
  return reduce(
    fringes,
    (curr: number, fringe: Model.Fringe | Tables.FringeRow): number => {
      const unit = tabling.typeguards.isRow(fringe) ? fringe.data.unit : fringe.unit;
      const rate = tabling.typeguards.isRow(fringe) ? fringe.data.rate : fringe.rate;
      const cutoff = tabling.typeguards.isRow(fringe) ? fringe.data.cutoff : fringe.cutoff;
      if (!isNil(unit) && !isNil(rate)) {
        if (unit.id === models.FringeUnitModels.FLAT.id) {
          return curr + rate;
        } else {
          if (cutoff === null || cutoff >= value) {
            return curr + rate * value;
          } else {
            return curr + rate * cutoff;
          }
        }
      }
      return curr;
    },
    0.0
  );
};
