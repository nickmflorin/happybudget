import { isNil, reduce } from "lodash";

import { model, tabling } from "lib";

export const contributionFromFringes = (value: number, fringes: (Model.Fringe | Tables.FringeRow)[]): number => {
  return reduce(
    fringes,
    (curr: number, fringe: Model.Fringe | Tables.FringeRow): number => {
      const unit = tabling.typeguards.isRow(fringe) ? fringe.data.unit : fringe.unit;
      const rate = tabling.typeguards.isRow(fringe) ? fringe.data.rate : fringe.rate;
      const cutoff = tabling.typeguards.isRow(fringe) ? fringe.data.cutoff : fringe.cutoff;
      if (!isNil(unit) && !isNil(rate)) {
        if (unit.id === model.models.FringeUnitModels.FLAT.id) {
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

export const contributionFromMarkups = <R extends Table.RowData>(
  value: number,
  markups: (Model.Markup | Table.MarkupRow<R>)[]
): number => {
  return reduce(
    markups,
    (curr: number, markup: Model.Markup | Table.MarkupRow<R>): number => {
      const unit = tabling.typeguards.isRow(markup) ? markup.markupData.unit : markup.unit;
      const rate = tabling.typeguards.isRow(markup) ? markup.markupData.rate : markup.rate;
      if (!isNil(unit) && !isNil(rate)) {
        if (unit.id === model.models.FringeUnitModels.FLAT.id) {
          return curr + rate;
        } else {
          return curr + rate * value;
        }
      }
      return curr;
    },
    0.0
  );
};
