import React from "react";

import { framework } from "components/tabling/generic";
import { ValueCell } from "components/tabling/generic/framework/cells";

const IdentifierCell = <
  R extends Tables.BudgetRowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
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
    model.RowTypedApiModel,
    BudgetActionContext,
    Redux.BudgetTableStore<Tables.BudgetRowData>,
    string | null
  >,
  Tables.BudgetRowData,
  model.RowTypedApiModel,
  BudgetActionContext,
  Redux.BudgetTableStore<Tables.BudgetRowData>,
  string | null
>(React.memo(IdentifierCell)) as typeof IdentifierCell;
