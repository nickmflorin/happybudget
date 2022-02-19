import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, map, filter } from "lodash";

import { models, tabling, hooks } from "lib";
import { framework } from "tabling/generic";

import { selectors } from "app/Budgeting/store";
import { useGrouping, useMarkup } from "components/hooks";
import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import useKeyboardNavigation, { UseKeyboardNavigationReturnType } from "./useKeyboardNavigation";
import { Framework } from "./framework";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

type OmitProps =
  | keyof UseKeyboardNavigationReturnType<R>
  | "showPageFooter"
  | "pinFirstColumn"
  | "tableId"
  | "menuPortalId"
  | "savingChangesPortalId"
  | "cookieNames"
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup";

export type AuthenticatedTableProps<B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount> = Omit<
  AuthenticatedBudgetTableProps<R, M, S>,
  OmitProps
> & {
  readonly id: P["id"];
  readonly budgetId: B["id"];
  readonly domain: B["domain"];
  readonly parent: P | null;
  readonly parentType: P["type"];
  readonly actionContext: Tables.SubAccountTableContext;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
  readonly onOpenFringesModal: () => void;
  readonly onParentUpdated: (m: P) => void;
  readonly onBudgetUpdated: (m: B) => void;
};

const AuthenticatedTable = <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
  props: AuthenticatedTableProps<B, P>
): JSX.Element => {
  const { onBack, onLeft, onRight, onRowExpand } = useKeyboardNavigation(props);

  const fringes = useSelector((s: Application.Store) =>
    selectors.selectFringes(s, { domain: props.domain, parentType: props.parentType })
  );
  const subaccountUnits = useSelector((s: Application.Store) =>
    selectors.selectSubAccountUnits(s, { domain: props.domain, parentType: props.parentType })
  );

  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    models.inferModelFromName<Model.Tag>(subaccountUnits, name, {
      getName: (m: Model.Tag) => m.title,
      warnOnMissing: false
    })
  );

  const processFringesCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    /* Here, we convert from IDs to Rows then back to IDs to ensure that the
       IDs are valid. */
    return map(
      models.getModels<Tables.FringeRow>(fringes, models.parseIdsFromDeliminatedString(value), {
        warnOnMissing: false,
        modelName: "fringe"
      }),
      (m: Tables.FringeRow) => m.id
    );
  });

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fs = models.getModels<Tables.FringeRow>(fringes, row.fringes, { modelName: "fringe" });
    return map(fs, (fringe: Tables.FringeRow) => fringe.id).join(", ");
  });

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: props.id,
    parentType: props.parentType,
    table: props.table.current,
    onGroupUpdated: (group: Model.Group) =>
      props.table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup<
    R,
    M,
    Model.SubAccount,
    B,
    P,
    Http.AncestryResponse<B, P, Model.Markup>
  >({
    parentId: props.id,
    parentType: props.parentType,
    table: props.table.current,
    onResponse: (response: Http.AncestryResponse<B, P, Model.Markup>) => {
      props.onParentUpdated(response.parent);
      props.onBudgetUpdated(response.budget);
    }
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(props.columns, {
        unit: {
          processCellFromClipboard: processUnitCellFromClipboard
        },
        fringes: {
          cellEditor: "FringesEditor",
          cellEditorParams: { onAddFringes: () => props.onOpenFringesModal() },
          processCellFromClipboard: processFringesCellFromClipboard,
          headerComponentParams: { onEdit: () => props.onOpenFringesModal() },
          processCellForClipboard: processFringesCellForClipboard
        },
        identifier: { headerName: props.parentType === "account" ? "Account" : "Line" },
        description: { headerName: `${props.parentType === "account" ? "SubAccount" : "Detail"} Description` }
      }),
    [
      props.onOpenFringesModal,
      props.parentType,
      hooks.useDeepEqualMemo(props.columns),
      processUnitCellFromClipboard,
      processFringesCellForClipboard,
      processFringesCellFromClipboard
    ]
  );

  const actions: Table.AuthenticatedMenuActions<R, M> = useMemo(
    () => (params: Table.AuthenticatedMenuActionParams<R, M>) =>
      [
        {
          icon: "folder",
          label: "Subtotal",
          isWriteOnly: true,
          onClick: () => {
            let rows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            if (rows.length === 0) {
              const focusedRow = props.table.current.getFocusedRow();
              if (!isNil(focusedRow) && tabling.typeguards.isModelRow(focusedRow)) {
                rows = [focusedRow];
              }
            }
            if (rows.length !== 0) {
              onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id));
            }
          }
        },
        {
          icon: "badge-percent",
          label: "Mark Up",
          isWriteOnly: true,
          onClick: () => {
            const selectedRows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            /* If rows are explicitly selected for the Markup, we want to
							 include them as the default children for the Markup in the
							 modal, which will default the unit in the modal to PERCENT. */
            if (selectedRows.length !== 0) {
              onCreateMarkup(map(selectedRows, (row: Table.ModelRow<R>) => row.id));
            } else {
              const rows: Table.ModelRow<R>[] = filter(props.table.current.getRows(), (r: Table.BodyRow<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[];
              if (rows.length !== 0) {
                onCreateMarkup();
              }
            }
          }
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
        framework.actions.ExportCSVAction<R, M>(
          props.table.current,
          params,
          !isNil(props.parent)
            ? `${props.parent.type}-${props.parent.identifier || props.parent.description || ""}`
            : ""
        )
      ],
    [props.actions, props.table.current, onCreateMarkup, onCreateGroup]
  );

  return (
    <React.Fragment>
      <AuthenticatedBudgetTable
        {...props}
        columns={columns}
        showPageFooter={true}
        pinFirstColumn={true}
        tableId={`${props.domain}-${props.parentType}-subaccounts`}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
        framework={Framework}
        getModelRowName={(r: Table.DataRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel={"Markup"}
        getModelRowLabel={"Line"}
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows?: Table.ModelRow<R>[]) =>
          rows === undefined ? onCreateMarkup() : onCreateMarkup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.managers.markupId(row.id))}
        actions={actions}
        onBack={onBack}
        onRowExpand={onRowExpand}
        onLeft={onLeft}
        onRight={onRight}
      />
      {markupModals}
      {groupModals}
    </React.Fragment>
  );
};

export default AuthenticatedTable;