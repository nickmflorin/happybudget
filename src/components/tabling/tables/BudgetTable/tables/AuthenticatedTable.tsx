import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

import { tabling } from "lib";

import { AuthenticatedBudgetDataGrid } from "../grids";
import { Framework } from "../framework";

export type AuthenticatedBudgetTableProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = Omit<
  AuthenticatedTableProps<R, M>,
  "children"
> & {
  readonly onBack?: () => void;
  // Markup is currently not applicable for Templates.
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
};

/* eslint-disable indent */
const AuthenticatedBudgetTable = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  onEditMarkup,
  ...props
}: AuthenticatedBudgetTableProps<R, M>): JSX.Element => {
  return (
    <AuthenticatedTable<R, M>
      {...props}
      expandColumn={{ cellRendererParams: { onEdit: (row: Table.MarkupRow<R>) => onEditMarkup?.(row) } }}
      framework={tabling.aggrid.combineFrameworks(Framework, props.framework)}
    >
      {(params: AuthenticatedTableDataGridProps<R, M>) => (
        <AuthenticatedBudgetDataGrid<R, M>
          {...params}
          onBack={props.onBack}
          rowCanExpand={props.rowCanExpand}
          onRowExpand={props.onRowExpand}
        />
      )}
    </AuthenticatedTable>
  );
};

export default AuthenticatedBudgetTable;
