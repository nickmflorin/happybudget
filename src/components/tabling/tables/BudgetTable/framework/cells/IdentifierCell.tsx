import { tabling } from "lib";
import { ValueCell, GroupCell } from "components/tabling/generic/framework/cells";

interface IdentifierCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.BudgetTableStore<R, M> = Redux.BudgetTableStore<R, M>
> extends Table.ValueCellProps<R, M, S> {
  readonly onGroupEdit?: (group: Model.BudgetGroup) => void;
}

/* eslint-disable indent */
const IdentifierCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.BudgetTableStore<R, M> = Redux.BudgetTableStore<R, M>
>({
  onGroupEdit,
  ...props
}: IdentifierCellProps<R, M, S>): JSX.Element => {
  const row: Table.Row<R> = props.node.data;
  return (
    <span>
      {tabling.typeguards.isGroupRow(row) ? <GroupCell onEdit={onGroupEdit} {...props} /> : <ValueCell {...props} />}
    </span>
  );
};

export default IdentifierCell;
