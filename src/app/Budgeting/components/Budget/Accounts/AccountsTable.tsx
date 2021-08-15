import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-regular-svg-icons";

import { redux, tabling } from "lib";
import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { BudgetAccountsTable } from "components/tabling";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import { selectCommentsHistoryDrawerOpen } from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/accounts";
import PreviewModal from "../PreviewModal";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.groups.data
);
const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.search
);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const groups = useSelector(selectGroups);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);

  const table = tabling.hooks.useBudgetTable<Tables.AccountRow, Model.Account>();

  return (
    <React.Fragment>
      <BudgetAccountsTable
        table={table}
        data={data}
        groups={groups}
        search={search}
        budget={budget}
        menuPortalId={"supplementary-header"}
        onSearch={(value: string) => dispatch(actions.setAccountsSearchAction(value))}
        onChangeEvent={(e: Table.ChangeEvent<Tables.AccountRow, Model.Account>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        onGroupRows={(rows: Tables.AccountRow[]) => setGroupAccounts(map(rows, (row: Tables.AccountRow) => row.id))}
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
        actions={[
          {
            icon: faPrint,
            text: "Export PDF",
            onClick: () => setPreviewModalVisible(true)
          },
          {
            text: "Comments",
            icon: faCommentsAlt,
            onClick: () => dispatch(setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen))
          }
        ]}
      />
      {!isNil(groupAccounts) && !isNil(budgetId) && (
        <CreateBudgetAccountGroupModal
          budgetId={budgetId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
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
            if (group.color !== groupToEdit.color) {
              table.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <PreviewModal
        autoRenderPdf={false}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        budgetId={budgetId}
        budgetName={!isNil(budget) ? `${budget.name} Budget` : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </React.Fragment>
  );
};

export default AccountsTable;
