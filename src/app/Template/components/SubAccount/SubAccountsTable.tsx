import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling } from "lib";

import { CreateGroupModal, EditGroupModal } from "components/modals";
import { SubAccountsTable as GenericSubAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.table.subaccountUnits
);

const ActionMap = {
  tableChanged: actions.subAccount.handleTableChangeEventAction,
  loading: actions.subAccount.loadingAction,
  response: actions.subAccount.responseAction,
  saving: actions.subAccount.savingTableAction,
  addModelsToState: actions.subAccount.addModelsToStateAction,
  setSearch: actions.subAccount.setSearchAction,
  clear: actions.subAccount.clearAction
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
    (state: Application.Authenticated.Store) => state.template.subaccount.table
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
          (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
        )
      ],
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Sub Account Total",
        estimated: !isNil(detail) ? detail.estimated + detail.markup_contribution + detail.fringe_contribution : 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly templateId: number;
  readonly template: Model.Template | null; // Not currently used, but including it is consistent.
}

const SubAccountsTable = ({ subaccountId, template, templateId }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);

  const history = useHistory();
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);

  const table = tabling.hooks.useTable<R>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"subaccount-subaccounts-table"}
        table={table}
        fringes={fringes}
        subAccountUnits={subAccountUnits}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        onRowExpand={null}
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onBack={() => {
          if (
            !isNil(subaccountDetail) &&
            !isNil(subaccountDetail.ancestors) &&
            subaccountDetail.ancestors.length !== 0
          ) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/templates/${templateId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/templates/${templateId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
        onGroupRows={(rows: (Table.ModelRow<R> | Table.MarkupRow<R>)[]) =>
          setGroupSubAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R> | Table.MarkupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R>[],
              (row: Table.ModelRow<R>) => row.id
            )
          )
        }
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
      />
      {!isNil(groupSubAccounts) && (
        <CreateGroupModal
          id={subaccountId}
          parentType={"subaccount"}
          children={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupSubAccounts(undefined);
            table.current.applyTableChange({
              type: "groupAdded",
              payload: group
            });
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={tabling.rows.groupId(groupToEdit.id)}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            table.current.applyTableChange({
              type: "groupUpdated",
              payload: { id: group.id, data: group }
            });
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
