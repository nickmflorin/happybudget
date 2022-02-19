import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, filter } from "lodash";

import { tabling, budgeting } from "lib";

import { connectTableToAuthenticatedStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { SubAccountPage } from "../Pages";
import { actions, selectors, sagas } from "../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedBudgetProps<Model.SubAccount>,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.budget.subAccount.handleTableChangeEventAction,
    loading: actions.budget.subAccount.loadingAction,
    response: actions.budget.subAccount.responseAction,
    addModelsToState: actions.budget.subAccount.addModelsToStateAction,
    setSearch: actions.budget.subAccount.setSearchAction
  },
  tableId: "budget-subaccount-subaccounts-table",
  selector: (s: Application.Store) =>
    selectors.selectSubAccountsTableStore(s, { parentType: "subaccount", domain: "budget" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.subAccount.createTableSaga(table),
  footerRowSelectors: {
    page: createSelector(
      (state: Application.Store) => state.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    ),
    footer: createSelector(
      (state: Application.Store) => state.budget.subaccount.detail.data,
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0,
        variance: !isNil(detail) ? budgeting.businessLogic.varianceValue(detail) : 0.0,
        actual: detail?.actual || 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedBudget);

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccount = ({ setPreviewModalVisible, ...props }: SubAccountProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const dispatch = useDispatch();

  const subaccount = useSelector((s: Application.Store) => selectors.selectSubAccountDetail(s, { domain: "budget" }));
  const table = tabling.hooks.useTable<Tables.SubAccountRowData, Model.SubAccount>();

  useEffect(() => {
    dispatch(actions.budget.subAccount.requestSubAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(subaccount)) {
      budgeting.urls.setLastVisited(props.budget, subaccount);
    }
  }, [props.budget, subaccount]);

  useEffect(() => {
    dispatch(actions.budget.subAccount.requestAction(null, { id: props.id, budgetId: props.budgetId }));
  }, [props.id, props.budgetId]);

  return (
    <SubAccountPage detail={subaccount} budget={props.budget}>
      <ConnectedTable
        {...props}
        parent={subaccount}
        actionContext={{ budgetId: props.budgetId, id: props.id }}
        parentType={"subaccount"}
        onExportPdf={() => setPreviewModalVisible(true)}
        onOpenFringesModal={() => setFringesModalVisible(true)}
        table={table}
        onParentUpdated={(p: Model.SubAccount) =>
          dispatch(actions.budget.subAccount.updateInStateAction({ id: p.id, data: p }))
        }
        onBudgetUpdated={(b: Model.Budget) => dispatch(actions.budget.updateBudgetInStateAction({ id: b.id, data: b }))}
        onShared={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } })
          )
        }
        onShareUpdated={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } })
          )
        }
        onUnshared={() =>
          dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: null } }))
        }
        onAttachmentRemoved={(row: Table.ModelRow<R>, rowId: number) =>
          dispatch(
            actions.budget.subAccount.updateRowsInStateAction({
              id: row.id,
              data: {
                attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== rowId)
              }
            })
          )
        }
        onAttachmentAdded={(row: Table.ModelRow<R>, attachment: Model.Attachment) =>
          dispatch(
            actions.budget.subAccount.updateRowsInStateAction({
              id: row.id,
              data: {
                attachments: [
                  ...(row.data.attachments || []),
                  { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
                ]
              }
            })
          )
        }
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"subaccount"}
        onCancel={() => setFringesModalVisible(false)}
      />
    </SubAccountPage>
  );
};

export default SubAccount;