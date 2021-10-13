import { framework } from "components/tabling/generic";
import { ValueCell } from "components/tabling/generic/framework/cells";

interface IdentifierCellProps<
  R extends Tables.BudgetRowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> extends Table.ValueCellProps<R, M, S> {
  readonly onGroupEdit?: (group: Table.GroupRow<R>) => void;
}

/* eslint-disable indent */
const IdentifierCell = <
  R extends Tables.BudgetRowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>({
  onGroupEdit,
  ...props
}: IdentifierCellProps<R, M, S>): JSX.Element => {
  return <ValueCell<R, M> {...props} />;
};

export default framework.connectCellToStore<any, any>(IdentifierCell) as typeof IdentifierCell;
