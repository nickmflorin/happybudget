import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectTemplateId, selectSubAccountUnits } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/account";
import TemplateSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.children.search
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.detail.data
);
const selectAccountLoading = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.detail.loading
);
const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.fringes.data
);

interface SubAccountsTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const accountLoading = useSelector(selectAccountLoading);
  const groups = useSelector(selectGroups);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        data={data}
        groups={groups}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        fringesCellEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          colId: "fringes"
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesCellEditor={"TemplateAccountFringesCellEditor"}
        loadingParent={accountLoading}
        tableFooterIdentifierValue={
          !isNil(accountDetail) && !isNil(accountDetail.description)
            ? `${accountDetail.description} Total`
            : "Account Total"
        }
        exportFileName={!isNil(accountDetail) ? `account_${accountDetail.identifier}` : ""}
        search={search}
        onSearch={(value: string) => dispatch(actions.setSubAccountsSearchAction(value))}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        cookies={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
        onChangeEvent={(e: Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/subaccounts/${id}`)}
        onBack={() => history.push(`/templates/${templateId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: BudgetTable.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.SubAccountRow) => row.id))
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
            dispatch(actions.addGroupToStateAction(group));
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
            dispatch(actions.updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
