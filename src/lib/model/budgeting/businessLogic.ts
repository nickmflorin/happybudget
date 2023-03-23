import { isNil, reduce, filter, includes } from "lodash";

import * as tabling from "../tabling";

import * as typeguards from "./typeguards";
import * as types from "./types";

type GroupObj<R extends types.BudgetRowData> = tabling.GroupRow<R> | types.Group;

type GroupChild<R extends tabling.BudgetRowData> =
  | tabling.DataRow<R>
  | types.Account
  | types.SubAccount
  | types.PdfAccount
  | types.PdfSubAccount;

type WithActual<R extends tabling.BudgetRowData> =
  | tabling.DataRow<R>
  | types.Account
  | types.SubAccount
  | types.PdfAccount
  | types.PdfSubAccount
  | types.Budget
  | types.PdfBudget
  | types.Template;

type WithEstimation<R extends tabling.BudgetRowData> = WithActual<R> | types.Template;

const isGroupObj = <R extends tabling.BudgetRowData = tabling.BudgetRowData>(
  obj: WithEstimation<R> | GroupObj<R>,
): obj is GroupObj<R> =>
  (tabling.rows.isRow(obj) && tabling.rows.isGroupRow(obj)) ||
  (!tabling.rows.isRow(obj) && typeguards.isGroup(obj));

export const nominalValue = <R extends tabling.BudgetRowData = tabling.BudgetRowData>(
  obj: WithEstimation<R>,
): number => (tabling.rows.isRow(obj) ? obj.data.nominal_value : obj.nominal_value);

export const accumulatedMarkupContribution = <
  R extends tabling.BudgetRowData = tabling.BudgetRowData,
>(
  obj: WithEstimation<R>,
) =>
  tabling.rows.isRow(obj)
    ? obj.data.accumulated_markup_contribution
    : obj.accumulated_markup_contribution;

export const accumulatedFringeContribution = <
  R extends tabling.BudgetRowData = tabling.BudgetRowData,
>(
  obj: WithEstimation<R>,
) =>
  tabling.rows.isRow(obj)
    ? obj.data.accumulated_fringe_contribution
    : obj.accumulated_fringe_contribution;

export const fringeContribution = <R extends tabling.BudgetRowData = tabling.BudgetRowData>(
  obj: WithEstimation<R>,
) =>
  // Only SubAccount(s) have a Fringe Contribution.
  tabling.rows.isRow(obj) && typeguards.isSubAccountRow(obj)
    ? obj.data.fringe_contribution
    : !tabling.rows.isRow(obj) && (typeguards.isSubAccount(obj) || typeguards.isPdfSubAccount(obj))
    ? obj.fringe_contribution
    : 0.0;

export const estimatedValue = <
  R extends tabling.BudgetRowData = tabling.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>,
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[],
): number => {
  if (isGroupObj(obj)) {
    if (children === undefined) {
      throw new Error(
        `The children must be provided in order to calculate value for a Group
				related object.`,
      );
    }
    return reduce(
      filter(children, (c: C) => includes(obj.children, c.id)),
      (curr: number, c: C) => curr + nominalValue(c),
      0.0,
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
  R extends tabling.BudgetRowData = tabling.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>,
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[],
): number => {
  if (isGroupObj(obj)) {
    if (children === undefined) {
      throw new Error(
        `The children must be provided in order to calculate value for a Group
				related object.`,
      );
    }
    return reduce(
      filter(children, (c: C) => includes(obj.children, c.id)),
      (curr: number, c: C) => curr + actualValue(c),
      0.0,
    );
  }
  return tabling.rows.isRow(obj) ? obj.data.actual : obj.actual;
};

export const varianceValue = <
  R extends tabling.BudgetRowData = tabling.BudgetRowData,
  C extends GroupChild<R> = GroupChild<R>,
>(
  obj: WithEstimation<R> | GroupObj<R>,
  /* These are not necessarily only the models associated with being a child of
	   the Group, as they will be filtered down to be so regardless. */
  children?: C[],
): number => estimatedValue(obj, children) - actualValue(obj, children);

export const contributionFromMarkups = <R extends tabling.RowData = tabling.BudgetRowData>(
  value: number,
  markups: (types.Markup | tabling.MarkupRow<R>)[],
): number => {
  const unit = (m: types.Markup | tabling.MarkupRow<R>) =>
    tabling.rows.isRow(m) ? m.markupData.unit : m.unit;
  return reduce(
    filter(
      markups,
      (m: types.Markup | tabling.MarkupRow<R>) => unit(m).id === models.MarkupUnits.percent.id,
    ),
    (curr: number, markup: types.Markup | tabling.MarkupRow<R>): number => {
      const rate = tabling.rows.isRow(markup) ? markup.markupData.rate : markup.rate;
      if (!isNil(rate)) {
        return curr + rate * value;
      }
      return curr;
    },
    0.0,
  );
};

export const contributionFromFringes = (
  value: number,
  fringes: (types.Fringe | tabling.ModelRow<tabling.FringeRowData>)[],
): number =>
  reduce(
    fringes,
    (curr: number, fringe: types.Fringe | tabling.FringeRow): number => {
      const unit = tabling.rows.isRow(fringe) ? fringe.data.unit : fringe.unit;
      const rate = tabling.rows.isRow(fringe) ? fringe.data.rate : fringe.rate;
      const cutoff = tabling.rows.isRow(fringe) ? fringe.data.cutoff : fringe.cutoff;
      if (!isNil(unit) && !isNil(rate)) {
        if (unit.id === models.FringeUnits.flat.id) {
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
    0.0,
  );
