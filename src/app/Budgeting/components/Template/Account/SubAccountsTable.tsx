import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import TemplateSubAccountsTable from "../SubAccountsTable";
import { selectTemplateId, selectSubAccountUnits } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/account";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.search
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.detail.data
);
const selectAccountLoading = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.detail.loading
);

interface SubAccountsTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const accountLoading = useSelector(selectAccountLoading);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        data={data}
        groups={groups}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
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
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.TemplateSubAccountRow>) =>
          dispatch(actions.bulkCreateSubAccountsAction(payload))
        }
        onRowDelete={(ids: number | number[]) => dispatch(actions.deleteSubAccountsAction(ids))}
        onTableChange={(payload: Table.Change<BudgetTable.TemplateSubAccountRow>) =>
          dispatch(actions.tableChangedAction(payload))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/subaccounts/${id}`)}
        onBack={() => history.push(`/templates/${templateId}/accounts?row=${accountId}`)}
        onDeleteGroup={(group: Model.TemplateGroup) => dispatch(actions.deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.TemplateSubAccountRow) =>
          dispatch(actions.removeSubAccountFromGroupAction(row.id))
        }
        onRowAddToGroup={(group: number, row: BudgetTable.TemplateSubAccountRow) =>
          dispatch(actions.addSubAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.TemplateSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.TemplateSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.TemplateGroup) => setGroupToEdit(group)}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.TemplateGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupToEdit(undefined);
            dispatch(actions.updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
