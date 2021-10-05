import * as typeguards from "./typeguards";

export const estimatedValue = <R extends Tables.BudgetRowData>(r: Table.DataRow<R>): number => {
  if (typeguards.isSubAccountRow(r)) {
    return (
      r.data.nominal_value +
      r.data.accumulated_markup_contribution +
      r.data.fringe_contribution +
      r.data.accumulated_fringe_contribution
    );
  }
  return r.data.nominal_value + r.data.accumulated_markup_contribution + r.data.accumulated_fringe_contribution;
};
