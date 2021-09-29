import { tabling } from "lib";
import { framework } from "components/tabling/generic";
import { ValueCell, GroupCell } from "components/tabling/generic/framework/cells";

interface IdentifierCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.BudgetTableStore<R, M> = Redux.BudgetTableStore<R, M>
> extends Table.ValueCellProps<R, M, S> {
  readonly onGroupEdit?: (group: Table.GroupRow<R>) => void;
}

/* eslint-disable indent */
const IdentifierCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.BudgetTableStore<R, M> = Redux.BudgetTableStore<R, M>
>({
  onGroupEdit,
  ...props
}: IdentifierCellProps<R, M, S>): JSX.Element => {
  const row: Table.Row<R> = props.node.data;
  return tabling.typeguards.isGroupRow(row) ? (
    <GroupCell<R, M> onEdit={onGroupEdit} {...props} />
  ) : (
    <ValueCell<R, M> {...props} />
  );
};

export default framework.connectCellToStore<any, any>(IdentifierCell) as typeof IdentifierCell;
