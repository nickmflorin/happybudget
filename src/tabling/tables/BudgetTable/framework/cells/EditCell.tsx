import React from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import { EditCell as GenericEditCell, EditCellProps } from "tabling/generic/framework/cells";

const EditCell = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  C extends BudgetActionContext<B, false> = BudgetActionContext<B, false>,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: EditCellProps<R, M, C, S>
): JSX.Element => (
  <GenericEditCell
    {...props}
    alwaysShow={(row: Table.BodyRow<R>) =>
      tabling.rows.isModelRow(row) && !isNil(row.children) && row.children.length !== 0
    }
  />
);

export default React.memo(EditCell) as typeof EditCell;
