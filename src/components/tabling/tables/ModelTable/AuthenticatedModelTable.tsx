import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedDataGrid,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

export type AuthenticatedModelTableProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = Omit<
  AuthenticatedTableProps<R, M>,
  "children"
>;

/* eslint-disable indent */
const AuthenticatedModelTable = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: AuthenticatedModelTableProps<R, M>
): JSX.Element => {
  return (
    <AuthenticatedTable<R, M> {...props}>
      {(params: AuthenticatedTableDataGridProps<R, M>) => <AuthenticatedDataGrid<R, M> {...params} />}
    </AuthenticatedTable>
  );
};

export default AuthenticatedModelTable;
