import React from "react";
import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedDataGrid,
  AuthenticatedTableDataGridProps
} from "tabling/generic";

export type AuthenticatedModelTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = AuthenticatedTableProps<R, M, S>;

const AuthenticatedModelTable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: AuthenticatedModelTableProps<R, M, S>
): JSX.Element => {
  return (
    <AuthenticatedTable<R, M, S> {...props}>
      {(params: AuthenticatedTableDataGridProps<R, M>) => <AuthenticatedDataGrid<R, M> {...props} {...params} />}
    </AuthenticatedTable>
  );
};

export default React.memo(AuthenticatedModelTable) as typeof AuthenticatedModelTable;
