import React from "react";

import { framework } from "tabling/generic";
import { ValueCell } from "tabling/generic/framework/cells";

const IdentifierCell = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: Table.ValueCellProps<R, M, S, string | null>
): JSX.Element => {
  return <ValueCell<R, M, S, string | null> {...props} />;
};

export default framework.connectCellToStore<
  Table.ValueCellProps<
    Tables.BudgetRowData,
    Model.RowHttpModel,
    Redux.BudgetTableStore<Tables.BudgetRowData>,
    string | null
  >,
  Tables.BudgetRowData,
  Model.RowHttpModel,
  Redux.BudgetTableStore<Tables.BudgetRowData>,
  string | null
>(React.memo(IdentifierCell)) as typeof IdentifierCell;
