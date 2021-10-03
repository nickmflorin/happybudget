import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedDataGrid,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

export type AuthenticatedModelTableProps<
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
> = Omit<AuthenticatedTableProps<R, M>, "children">;

/* eslint-disable indent */
const AuthenticatedModelTable = <R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel>(
  props: AuthenticatedModelTableProps<R, M>
): JSX.Element => {
  return (
    <AuthenticatedTable<R, M> {...props}>
      {(params: AuthenticatedTableDataGridProps<R, M>) => <AuthenticatedDataGrid<R, M> {...props} {...params} />}
    </AuthenticatedTable>
  );
};

export default AuthenticatedModelTable;
