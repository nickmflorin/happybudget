import React from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import { EditCell as GenericEditCell, EditCellProps } from "tabling/generic/framework/cells";

/* eslint-disable indent */
const EditCell = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: EditCellProps<R, M, S>
): JSX.Element => {
  return (
    <GenericEditCell
      {...props}
      alwaysShow={(row: Table.BodyRow<R>) =>
        tabling.typeguards.isModelRow(row) && !isNil(row.children) && row.children.length !== 0
      }
    />
  );
};

export default React.memo(EditCell) as typeof EditCell;
