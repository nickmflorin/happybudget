import { isNil } from "lodash";

import { tabling } from "lib";

import { ExpandCell as GenericExpandCell, ExpandCellProps } from "components/tabling/generic/framework/cells";

/* eslint-disable indent */
const ExpandCell = <
  R extends Tables.BudgetRowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: ExpandCellProps<R, M, S>
): JSX.Element => {
  return (
    <GenericExpandCell
      {...props}
      alwaysShow={(row: Table.BodyRow<R>) =>
        tabling.typeguards.isModelRow(row) && !isNil(row.children) && row.children.length !== 0
      }
    />
  );
};

export default ExpandCell;
