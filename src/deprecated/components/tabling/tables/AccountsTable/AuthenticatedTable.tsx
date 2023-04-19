import React, { useMemo } from "react";

import { isNil, map, filter } from "lodash";
import { useHistory } from "react-router-dom";

import { tabling, budgeting } from "lib";
import { useGrouping, useMarkup } from "deprecated/components/model/hooks";
import { framework } from "deprecated/components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

type OmitProps =
  | "onRowExpand"
  | "showPageFooter"
  | "pinFirstColumn"
  | "tableId"
  | "menuPortalId"
  | "savingChangesPortalId"
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup";

export type AuthenticatedTableProps<B extends Model.BaseBudget> = Omit<
  AuthenticatedBudgetTableProps<R, M, B, AccountsTableContext<B, false>, S>,
  OmitProps
> & {
  readonly parent: B | null;
};

const AuthenticatedTable = <B extends Model.BaseBudget>(
  props: AuthenticatedTableProps<B>,
): JSX.Element => {
  const history = useHistory();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: props.tableContext.budgetId,
    parentType: "budget",
    table: props.table.current,
    onGroupUpdated: (group: Model.Group) =>
      props.table.current.dispatchEvent({
        type: "modelsUpdated",
        payload: group,
      }),
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: props.tableContext.budgetId,
    parentType: "budget",
    table: props.table.current,
  });

  const actions: Table.AuthenticatedMenuActions<R, M> = useMemo(
    () => (params: Table.AuthenticatedMenuActionParams<R, M>) =>
      [
        {
          icon: "folder",
          label: "Subtotal",
          isWriteOnly: true,
          onClick: () => {
            let rows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.rows.isModelRow(r),
            ) as Table.ModelRow<R>[];
            if (rows.length === 0) {
              const focusedRow = props.table.current.getFocusedRow();
              if (!isNil(focusedRow) && tabling.rows.isModelRow(focusedRow)) {
                rows = [focusedRow];
              }
            }
            if (rows.length !== 0) {
              onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id));
            }
          },
        },
        {
          icon: "badge-percent",
          label: "Mark Up",
          isWriteOnly: true,
          onClick: () => {
            const selectedRows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.rows.isModelRow(r),
            ) as Table.ModelRow<R>[];
            /* If rows are explicitly selected for the Markup, we want to
							 include them as the default children for the Markup in the
							 modal, which will default the unit in the modal to PERCENT. */
            if (selectedRows.length !== 0) {
              onCreateMarkup(map(selectedRows, (row: Table.ModelRow<R>) => row.id));
            } else {
              const rows: Table.ModelRow<R>[] = filter(
                props.table.current.getRows(),
                (r: Table.BodyRow<R>) => tabling.rows.isModelRow(r),
              ) as Table.ModelRow<R>[];
              if (rows.length !== 0) {
                onCreateMarkup();
              }
            }
          },
        },
        framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
        framework.actions.ExportCSVAction<R, M>(
          props.table.current,
          params,
          !isNil(props.parent) ? `${props.parent.type}-${props.parent.name}` : "",
        ),
        ...(isNil(props.actions)
          ? []
          : Array.isArray(props.actions)
          ? props.actions
          : props.actions(params)),
      ],
    [props.actions, props.table.current, onCreateMarkup, onCreateGroup],
  );

  return (
    <React.Fragment>
      <AuthenticatedBudgetTable
        {...props}
        showPageFooter={false}
        pinFirstColumn={true}
        getModelRowName={(r: Table.DataRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel="Markup"
        getModelRowLabel="Account"
        tableId={`${props.tableContext.domain}-accounts`}
        menuPortalId="supplementary-header"
        savingChangesPortalId="saving-changes"
        onGroupRows={(rows: Table.ModelRow<R>[]) =>
          onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onMarkupRows={(rows?: Table.ModelRow<R>[]) =>
          rows === undefined
            ? onCreateMarkup()
            : onCreateMarkup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.rows.markupId(row.id))}
        actions={actions}
        onRowExpand={(row: Table.ModelRow<R>) =>
          history.push(
            budgeting.urls.getUrl(
              { domain: props.tableContext.domain, id: props.tableContext.budgetId },
              { type: "account", id: row.id },
            ),
          )
        }
      />
      {markupModals}
      {groupModals}
    </React.Fragment>
  );
};

export default AuthenticatedTable;
