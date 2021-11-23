import { isNil, filter } from "lodash";

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
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<AuthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
  // Markup is currently not applicable for Templates.
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
};

/* eslint-disable indent */
const AuthenticatedBudgetTable = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  onEditMarkup,
  onEditGroup,
  ...props
}: AuthenticatedBudgetTableProps<R, M>): JSX.Element => {
  return (
    <AuthenticatedTable<R, M>
      {...props}
      generateNewRowData={(rows: Table.BodyRow<R>[]) => {
        const dataRows = filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
        if (dataRows.length !== 0) {
          const lastRow: Table.DataRow<R> = dataRows[dataRows.length - 1];
          if (!isNil(lastRow.data.identifier) && !isNaN(parseInt(lastRow.data.identifier))) {
            return { identifier: String(parseInt(lastRow.data.identifier) + 1) } as Partial<R>;
          }
        }
        return {};
      }}
      onEditRow={(g: Table.NonPlaceholderBodyRow<R>) =>
        (tabling.typeguards.isMarkupRow(g) && onEditMarkup?.(g)) ||
        (tabling.typeguards.isGroupRow(g) && onEditGroup?.(g))
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
