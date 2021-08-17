import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { redux, tabling } from "lib";
import { hooks } from "store";
import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { TemplateSubAccountsTable } from "components/tabling";

import { actions } from "../../../store";
import FringesModal from "./FringesModal";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.account.table.groups.data
);
const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.account.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.account.table.search
);
const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.account.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.account.table.fringes.data
);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly templateId: number;
  readonly template: Model.Template | undefined; // Not currently used, but including it is consistent.
}

const SubAccountsTable = ({ accountId, templateId, template }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = hooks.useSubAccountUnits();

  const tableRef = tabling.hooks.useReadWriteBudgetTable<Tables.SubAccountRow, Model.SubAccount>();

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        budget={template}
        tableRef={tableRef}
        levelType={"account"}
        menuPortalId={"supplementary-header"}
        models={data}
        groups={groups}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        tableFooterIdentifierValue={
          !isNil(accountDetail) && !isNil(accountDetail.description)
            ? `${accountDetail.description} Total`
            : "Account Total"
        }
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        search={search}
        onSearch={(value: string) => dispatch(actions.template.account.setSubAccountsSearchAction(value))}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        cookieNames={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
        onChangeEvent={(e: Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.template.account.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/subaccounts/${id}`)}
        onBack={() => history.push(`/templates/${templateId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: Tables.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Tables.SubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupSubAccounts(undefined);
            dispatch(actions.template.account.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            dispatch(actions.template.account.updateGroupInStateAction({ id: group.id, data: group }));
            if (group.color !== groupToEdit.color) {
              tableRef.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal template={template} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
