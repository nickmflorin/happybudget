import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-solid-svg-icons";

import * as api from "api";
import { download } from "lib/util/files";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import BudgetSubAccountsTable from "../SubAccountsTable";
import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import {
  selectBudgetDetail,
  selectCommentsHistoryDrawerOpen,
  selectBudgetId,
  selectSubAccountUnits
} from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/account";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.search
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.detail.data
);

interface AccountBudgetTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: AccountBudgetTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const budgetDetail = useSelector(selectBudgetDetail);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        data={data}
        groups={groups}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
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
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.BudgetSubAccountRow>) =>
          dispatch(actions.bulkCreateSubAccountsAction(payload))
        }
        onRowDelete={(ids: number | number[]) => dispatch(actions.deleteSubAccountsAction(ids))}
        onTableChange={(payload: Table.Change<BudgetTable.BudgetSubAccountRow>) =>
          dispatch(actions.tableChangedAction(payload))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onDeleteGroup={(group: Model.BudgetGroup) => dispatch(actions.deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.BudgetSubAccountRow) =>
          dispatch(actions.removeSubAccountFromGroupAction(row.id))
        }
        onRowAddToGroup={(group: number, row: BudgetTable.BudgetSubAccountRow) =>
          dispatch(actions.addSubAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.BudgetSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.BudgetSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
        actions={[
          {
            tooltip: "Export as PDF",
            icon: faPrint,
            text: "Export PDF",
            onClick: () => {
              if (!isNil(budgetId)) {
                api.getBudgetPdf(budgetId).then((response: any) => {
                  download(response, !isNil(budgetDetail) ? `${budgetDetail.name}.pdf` : "budget.pdf");
                });
              }
            }
          },
          {
            tooltip: "Comments",
            text: "Comments",
            icon: faCommentsAlt,
            onClick: () => dispatch(setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen))
          }
        ]}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.BudgetGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupToEdit(undefined);
            dispatch(actions.updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
