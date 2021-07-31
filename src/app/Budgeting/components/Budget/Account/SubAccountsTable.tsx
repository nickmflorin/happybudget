import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-solid-svg-icons";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import {
  selectBudgetDetail,
  selectCommentsHistoryDrawerOpen,
  selectBudgetId,
  selectSubAccountUnits
} from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/account";
import PreviewModal from "../PreviewModal";
import BudgetSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.children.search
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.detail.data
);
const selectAccountLoading = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.detail.loading
);
const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.fringes.data
);

interface AccountBudgetTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: AccountBudgetTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const budgetDetail = useSelector(selectBudgetDetail);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);
  const accountLoading = useSelector(selectAccountLoading);

  const tableRef = useRef<BudgetTable.Ref<BudgetTable.SubAccountRow, Model.SubAccount>>(null);

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        tableRef={tableRef}
        levelType={"account"}
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
        fringesCellEditor={"FringesCellEditor"}
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
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: BudgetTable.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.SubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
        actions={[
          {
            tooltip: "Export as PDF",
            icon: faPrint,
            text: "Export PDF",
            onClick: () => setPreviewModalVisible(true)
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
            if (group.color !== groupToEdit.color && !isNil(tableRef.current)) {
              tableRef.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
      {!isNil(budgetId) && (
        <PreviewModal
          visible={previewModalVisible}
          onCancel={() => setPreviewModalVisible(false)}
          budgetId={budgetId}
          filename={!isNil(budgetDetail) ? `${budgetDetail.name}.pdf` : "budget.pdf"}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
