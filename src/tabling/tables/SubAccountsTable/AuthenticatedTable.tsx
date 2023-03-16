import React, { useMemo } from "react";

import { isNil, map, filter } from "lodash";
import { useSelector } from "react-redux";

import { model, tabling, hooks, formatters } from "lib";
import * as store from "store";
import { selectors } from "app/Budgeting/store";
import { useGrouping, useMarkup } from "components/model/hooks";
import { framework } from "tabling/generic";

import { Framework } from "./framework";
import useKeyboardNavigation, { UseKeyboardNavigationReturnType } from "./useKeyboardNavigation";
import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";

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
  | "framework"
  | "getModelRowName"
  | "getMarkupRowName"
  | "getModelRowLabel"
  | "getMarkupRowLabel"
  | "onGroupRows"
  | "onMarkupRows"
  | "onEditMarkup"
  | "onEditGroup";

export type AuthenticatedTableProps<
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
> = Omit<
  AuthenticatedBudgetTableProps<R, M, B, SubAccountsTableActionContext<B, P>, S>,
  OmitProps
> & {
  readonly parent: P | null;
  readonly onViewFringes: (params?: { name?: string; rowId: Table.ModelRowId }) => void;
};

const AuthenticatedTable = <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
  props: AuthenticatedTableProps<B, P>,
): JSX.Element => {
  const { onBack, onLeft, onRight, onRowExpand, confirmExpandModal } = useKeyboardNavigation(props);

  const fringes = useSelector((s: Application.Store) =>
    selectors.selectFringes(s, props.tableContext),
  );
  const subaccountUnits = useSelector((s: Application.Store) =>
    store.selectors.selectSubAccountUnits(s),
  );

  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.inferModelFromName<Model.Tag>(subaccountUnits, name, {
      getName: (m: Model.Tag) => m.title,
      warnOnMissing: false,
    }),
  );

  const processFringesCellFromClipboard = hooks.useDynamicCallback((value: string) =>
    /* Here, we convert from IDs to Rows then back to IDs to ensure that the
       IDs are valid. */
    map(
      model.getModels<Tables.FringeRow>(fringes, model.parseIdsFromDeliminatedString(value), {
        warnOnMissing: false,
        modelName: "fringe",
      }),
      (m: Tables.FringeRow) => m.id,
    ),
  );

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fs = model.getModels<Tables.FringeRow>(fringes, row.fringes, { modelName: "fringe" });
    return map(fs, (fringe: Tables.FringeRow) => fringe.id).join(", ");
  });

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: props.tableContext.parentId,
    parentType: props.tableContext.parentType,
    table: props.table.current,
    onGroupUpdated: (group: Model.Group) =>
      props.table.current.dispatchEvent({
        type: "modelsUpdated",
        payload: group,
      }),
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup<
    R,
    M,
    Model.SubAccount,
    B,
    P,
    Http.AncestryResponse<B, P, Model.Markup>
  >({
    parentId: props.tableContext.parentId,
    parentType: props.tableContext.parentType,
    table: props.table.current,
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(props.columns, {
        unit: {
          processCellFromClipboard: processUnitCellFromClipboard,
        },
        fringes: {
          cellEditor: "FringesEditor",
          cellEditorParams: {
            onNewFringe: (params: { name?: string; rowId: Table.ModelRowId }) =>
              props.onViewFringes(params),
          },
          processCellFromClipboard: processFringesCellFromClipboard,
          headerComponentParams: { onEdit: () => props.onViewFringes() },
          processCellForClipboard: processFringesCellForClipboard,
        },
        identifier: {
          headerName: props.tableContext.parentType === "account" ? "Account" : "Line",
        },
        description: {
          headerName: `${
            props.tableContext.parentType === "account" ? "SubAccount" : "Detail"
          } Description`,
        },
      }),
    [
      props.onViewFringes,
      props.tableContext.parentType,
      hooks.useDeepEqualMemo(props.columns),
      processUnitCellFromClipboard,
      processFringesCellForClipboard,
      processFringesCellFromClipboard,
    ],
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
          !isNil(props.parent)
            ? `${props.parent.type}-${props.parent.identifier || props.parent.description || ""}`
            : "",
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
        columns={columns}
        showPageFooter={true}
        pinFirstColumn={true}
        tableId={`${props.tableContext.domain}-${props.tableContext.parentType}-subaccounts`}
        menuPortalId="supplementary-header"
        savingChangesPortalId="saving-changes"
        framework={Framework}
        getModelRowName={(r: Table.DataRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel="Markup"
        getModelRowLabel="Line"
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
        onBack={onBack}
        onRowExpand={onRowExpand}
        onLeft={onLeft}
        onRight={onRight}
        calculatedCellInfoTooltip={(
          cell: Table.CellConstruct<Table.ModelRow<R>, Table.CalculatedColumn<R, M>>,
        ) =>
          cell.row.children.length === 0 &&
          cell.col.field === "estimated" &&
          model.budgeting.estimatedValue(cell.row) !== 0
            ? [
                {
                  label: "Nominal Value",
                  value: cell.row.data.nominal_value,
                  formatter: formatters.currencyFormatter,
                },
                {
                  label: "Fringe Contribution",
                  value: cell.row.data.fringe_contribution,
                  formatter: formatters.currencyFormatter,
                },
                {
                  label: "Markup Contribution",
                  value: cell.row.data.markup_contribution,
                  formatter: formatters.currencyFormatter,
                },
              ]
            : null
        }
      />
      {markupModals}
      {groupModals}
      {confirmExpandModal}
    </React.Fragment>
  );
};

export default AuthenticatedTable;
