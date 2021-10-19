import { isNil, map, filter } from "lodash";

import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

import { tabling } from "lib";

import { AuthenticatedBudgetDataGrid } from "../grids";
import { Framework } from "../framework";

export type AuthenticatedBudgetTableProps<
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
> = Omit<AuthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
  // Markup is currently not applicable for Templates.
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
};

/* eslint-disable indent */
const AuthenticatedBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
>({
  onEditMarkup,
  onEditGroup,
  ...props
}: AuthenticatedBudgetTableProps<R, M>): JSX.Element => {
  return (
    <AuthenticatedTable<R, M>
      {...props}
      generateNewRowData={(rows: Table.BodyRow<R>[]) => {
        const dataRows = filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
        const numericIdentifiers: number[] = map(
          filter(dataRows, (r: Table.DataRow<R>) => !isNil(r.data.identifier) && !isNaN(parseInt(r.data.identifier))),
          (r: Table.DataRow<R>) => parseInt(r.data.identifier as string)
        );
        if (numericIdentifiers.length !== 0) {
          return { identifier: String(Math.max(...numericIdentifiers) + 1) } as Partial<R>;
        }
        return {};
      }}
      onEditRow={(r: Table.EditableRow<R>) =>
        (tabling.typeguards.isMarkupRow(r) && onEditMarkup?.(r)) ||
        (tabling.typeguards.isGroupRow(r) && onEditGroup?.(r))
      }
      expandActionBehavior={(r: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(r) || tabling.typeguards.isGroupRow(r) ? "edit" : "expand"
      }
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
