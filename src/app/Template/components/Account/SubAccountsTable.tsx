import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling } from "lib";
import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { SubAccountsTable as GenericSubAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.account.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.account.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.account.table.subaccountUnits
);

const ActionMap = {
  tableChanged: actions.account.handleTableChangeEventAction,
  loading: actions.account.loadingAction,
  response: actions.account.responseAction,
  saving: actions.account.savingTableAction,
  addModelsToState: actions.account.addModelsToStateAction,
  setSearch: actions.account.setSearchAction,
  clear: actions.account.clearAction
};

const ConnectedTable = connectTableToStore<
  GenericSubAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.SubAccountTableStore
>({
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  actions: ActionMap,
  selector: redux.selectors.simpleDeepEqualSelector(
    (state: Application.Authenticated.Store) => state.template.account.table
  ),
  footerRowSelectors: {
    page: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data)],
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budget.estimated + budget.markup_contribution + budget.fringe_contribution : 0.0
      })
    ),
    footer: createSelector(
      [
        redux.selectors.simpleDeepEqualSelector(
          (state: Application.Authenticated.Store) => state.budget.account.detail.data
        )
      ],
      (detail: Model.Account | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? detail.estimated + detail.markup_contribution + detail.fringe_contribution : 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly templateId: number;
  readonly template: Model.Template | null; // Not currently used, but including it is consistent.
}

const SubAccountsTable = ({ accountId, templateId, template }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const accountDetail = useSelector(selectAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);

  const table = tabling.hooks.useTable<R, M>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"account-subaccounts-table"}
        table={table}
        fringes={fringes}
        subAccountUnits={subAccountUnits}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${templateId}/subaccounts/${row.id}`)}
        onBack={() => history.push(`/templates/${templateId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: (Table.ModelRow<R, M> | Table.MarkupRow<R>)[]) =>
          setGroupSubAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.MarkupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R, M>[],
              (row: Table.ModelRow<R, M>) => row.id
            )
          )
        }
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupSubAccounts(undefined);
            dispatch(
              actions.account.handleTableChangeEventAction({
                type: "groupAdd",
                payload: group
              })
            );
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={groupToEdit.group}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            dispatch(
              actions.account.handleTableChangeEventAction({
                type: "groupUpdate",
                payload: { id: group.id, data: group }
              })
            );
            if (group.color !== groupToEdit.groupData.color) {
              table.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal template={template} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
