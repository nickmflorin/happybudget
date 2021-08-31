import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedDataGrid,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

export type AuthenticatedModelTableProps<R extends Table.RowData, M extends Model.Model = Model.Model> = Omit<
  AuthenticatedTableProps<R, M, Model.Group>,
  "children"
>;

/* eslint-disable indent */
const AuthenticatedModelTable = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  props: AuthenticatedModelTableProps<R, M>
): JSX.Element => {
  return (
    <AuthenticatedTable<R, M, Model.Group> {...props}>
      {(params: AuthenticatedTableDataGridProps<R, M, Model.Group>) => (
        <AuthenticatedDataGrid<R, M, Model.Group> {...params} />
      )}
    </AuthenticatedTable>
  );
};

export default AuthenticatedModelTable;
