import React from "react";

import { framework } from "tabling/generic";
import { ValueCell } from "tabling/generic/framework/cells";

const IdentifierCell = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean,
  C extends BudgetActionContext<B, PUBLIC> = BudgetActionContext<B, PUBLIC>,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>,
>(
  props: Table.ValueCellProps<R, M, C, S, string | null>,
): JSX.Element => <ValueCell<R, M, C, S, string | null> {...props} />;

export default framework.connectCellToStore<
  Table.ValueCellProps<
    Tables.BudgetRowData,
    Model.RowHttpModel,
    BudgetActionContext,
    Redux.BudgetTableStore<Tables.BudgetRowData>,
    string | null
  >,
  Tables.BudgetRowData,
  Model.RowHttpModel,
  BudgetActionContext,
  Redux.BudgetTableStore<Tables.BudgetRowData>,
  string | null
>(React.memo(IdentifierCell)) as typeof IdentifierCell;
