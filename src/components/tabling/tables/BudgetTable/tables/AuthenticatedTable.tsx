import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

import { AuthenticatedBudgetDataGrid } from "../grids";

export type AuthenticatedBudgetTableProps<R extends Table.RowData, M extends Model.Model = Model.Model> = Omit<
  AuthenticatedTableProps<R, M, Model.BudgetGroup>,
  "children"
> & {
  readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
  readonly onBack?: () => void;
};

/* eslint-disable indent */
const AuthenticatedBudgetTable = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  props: AuthenticatedBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <AuthenticatedTable<R, M, Model.BudgetGroup> {...props}>
      {(params: AuthenticatedTableDataGridProps<R, M, Model.BudgetGroup>) => (
        <AuthenticatedBudgetDataGrid<R, M> {...params} />
      )}
    </AuthenticatedTable>
  );
};

export default AuthenticatedBudgetTable;
