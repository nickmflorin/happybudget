import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-solid-svg-icons";

import * as api from "api";
import { download } from "lib/util/files";

import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { setApplicationLoadingAction } from "store/actions";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import { selectCommentsHistoryDrawerOpen, selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/accounts";
import { generatePdf } from "../../../pdf";
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

  return (
    <React.Fragment>
      <GenericAccountsTable
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
            tooltip: "Export as PDF",
            icon: faPrint,
            text: "Export PDF",
            onClick: () => {
              if (!isNil(budgetId)) {
                dispatch(setApplicationLoadingAction(true));
                generatePdf(budgetId)
                  .then((response: Blob) => {
                    download(response, !isNil(budgetDetail) ? `${budgetDetail.name}.pdf` : "budget.pdf", {
                      includeExtensionInName: false
                    });
                  })
                  .catch((e: Error) => api.handleRequestError(e))
                  .finally(() => dispatch(setApplicationLoadingAction(false)));
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
          }}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsTable;
