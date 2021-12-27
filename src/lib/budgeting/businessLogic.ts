import { isNil, reduce, filter, includes } from "lodash";

import { tabling } from "lib";
import * as models from "./models";
import * as typeguards from "./typeguards";

type GroupObj<R extends Tables.BudgetRowData> = Table.GroupRow<R> | Model.Group;

type GroupChild<R extends Tables.BudgetRowData> =
  | Table.DataRow<R>
  | Model.Account
  | Model.SubAccount
  | Model.PdfAccount
  | Model.PdfSubAccount;

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

const isGroupObj = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(
  obj: WithEstimation<R> | GroupObj<R>
): obj is GroupObj<R> =>
  (tabling.typeguards.isRow(obj) && tabling.typeguards.isGroupRow(obj)) ||
  (!tabling.typeguards.isRow(obj) && typeguards.isGroup(obj));

export const nominalValue = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(obj: WithEstimation<R>): number =>
  tabling.typeguards.isRow(obj) ? obj.data.nominal_value : obj.nominal_value;

export const accumulatedMarkupContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(
  obj: WithEstimation<R>
) => (tabling.typeguards.isRow(obj) ? obj.data.accumulated_markup_contribution : obj.accumulated_markup_contribution);

export const accumulatedFringeContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(
  obj: WithEstimation<R>
) => (tabling.typeguards.isRow(obj) ? obj.data.accumulated_fringe_contribution : obj.accumulated_fringe_contribution);

export const fringeContribution = <R extends Tables.BudgetRowData = Tables.BudgetRowData>(obj: WithEstimation<R>) =>
  // Only SubAccount(s) have a Fringe Contribution.
  tabling.typeguards.isRow(obj) && typeguards.isSubAccountRow(obj)
    ? obj.data.fringe_contribution
    : !tabling.typeguards.isRow(obj) && (typeguards.isSubAccount(obj) || typeguards.isPdfSubAccount(obj))
    ? obj.fringe_contribution
    : 0.0;

export const estimatedValue = <
  R extends Tables.BudgetRowData = Tables.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[]
): number => {
  if (isGroupObj(obj)) {
    if (children === undefined) {
      throw new Error(
        `The children must be provided in order to calculate value for a Group
				related object.`
      );
    }
    return reduce(
      filter(children, (c: C) => includes(obj.children, c.id)) as C[],
      (curr: number, c: C) => curr + nominalValue(c),
      0.0
    );
  }

  return (
    nominalValue(obj) +
    accumulatedMarkupContribution(obj) +
    accumulatedFringeContribution(obj) +
    fringeContribution(obj)
  );
};

export const actualValue = <
  R extends Tables.BudgetRowData = Tables.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[]
): number => {
  if (isGroupObj(obj)) {
    if (children === undefined) {
      throw new Error(
        `The children must be provided in order to calculate value for a Group
				related object.`
      );
    }
    return reduce(
      filter(children, (c: C) => includes(obj.children, c.id)) as C[],
      (curr: number, c: C) => curr + actualValue(c),
      0.0
    );
  }
  return tabling.typeguards.isRow(obj) ? obj.data.actual : obj.actual;
};

export const varianceValue = <
  R extends Tables.BudgetRowData = Tables.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[]
): number => estimatedValue(obj, children) - actualValue(obj, children);

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

export const contributionFromFringes = (
  value: number,
  fringes: (Model.Fringe | Table.ModelRow<Tables.FringeRowData>)[]
): number => {
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
