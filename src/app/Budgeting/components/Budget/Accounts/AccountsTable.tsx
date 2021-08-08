import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-regular-svg-icons";

import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import { selectCommentsHistoryDrawerOpen, selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/accounts";
import PreviewModal from "../PreviewModal";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.search
);

const AccountsTable = (): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const budgetDetail = useSelector(selectBudgetDetail);
  const groups = useSelector(selectGroups);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);

  const tableRef = useRef<BudgetTable.Ref<BudgetTable.AccountRow, Model.Account>>(null);

  return (
    <React.Fragment>
      <GenericAccountsTable
        tableRef={tableRef}
        budgetType={"budget"}
        data={data}
        groups={groups}
        detail={budgetDetail}
        search={search}
        onSearch={(value: string) => dispatch(actions.setAccountsSearchAction(value))}
        exportFileName={!isNil(budgetDetail) ? `budget_${budgetDetail.name}_accounts` : ""}
        onChangeEvent={(e: Table.ChangeEvent<BudgetTable.AccountRow, Model.Account>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        onGroupRows={(rows: BudgetTable.AccountRow[]) =>
          setGroupAccounts(map(rows, (row: BudgetTable.AccountRow) => row.id))
        }
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            columnType: "sum",
            fieldBehavior: ["read"],
            footer: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0
            }
          },
          {
            field: "actual",
            headerName: "Actual",
            isCalculated: true,
            columnType: "sum",
            fieldBehavior: ["read"],
            footer: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
            }
          },
          {
            field: "variance",
            headerName: "Variance",
            isCalculated: true,
            columnType: "sum",
            fieldBehavior: ["read"],
            footer: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0
            }
          }
        ]}
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
            if (group.color !== groupToEdit.color && !isNil(tableRef.current)) {
              tableRef.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      {!isNil(budgetId) && (
        <PreviewModal
          autoRenderPdf={false}
          visible={previewModalVisible}
          onCancel={() => setPreviewModalVisible(false)}
          budgetId={budgetId}
          budgetName={
            !isNil(budgetDetail) ? `${budgetDetail.name} Budget` : `Sample Budget ${new Date().getFullYear()}`
          }
          filename={!isNil(budgetDetail) ? `${budgetDetail.name}.pdf` : "budget.pdf"}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsTable;
