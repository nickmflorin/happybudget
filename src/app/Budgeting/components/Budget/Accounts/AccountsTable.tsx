import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-solid-svg-icons";

import * as api from "api";
import { download } from "lib/util/files";

import * as models from "lib/model";
import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import { selectCommentsHistoryDrawerOpen, selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/accounts";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.groups.data
);
const selectData = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.budget.accounts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.search
);

const AccountsTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);

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
      <GenericAccountsTable<
        BudgetTable.BudgetAccountRow,
        Model.BudgetAccount,
        Model.BudgetGroup,
        Http.BudgetAccountPayload
      >
        data={data}
        groups={groups}
        manager={models.BudgetAccountRowManager}
        detail={budgetDetail}
        search={search}
        onSearch={(value: string) => dispatch(actions.setAccountsSearchAction(value))}
        exportFileName={!isNil(budgetDetail) ? `budget_${budgetDetail.name}_accounts` : ""}
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.BudgetAccountRow>) =>
          dispatch(actions.bulkCreateAccountsAction(payload))
        }
        onRowDelete={(ids: number | number[]) => dispatch(actions.deleteAccountsAction(ids))}
        onTableChange={(payload: Table.Change<BudgetTable.BudgetAccountRow>) =>
          dispatch(actions.tableChangedAction(payload))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        onDeleteGroup={(group: Model.BudgetGroup) => dispatch(actions.deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.BudgetAccountRow) =>
          dispatch(actions.removeAccountFromGroupAction(row.id))
        }
        onRowAddToGroup={(group: number, row: BudgetTable.BudgetAccountRow) =>
          dispatch(actions.addAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.BudgetAccountRow[]) =>
          setGroupAccounts(map(rows, (row: BudgetTable.BudgetAccountRow) => row.id))
        }
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            type: "sum",
            footer: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0
            }
          },
          {
            field: "actual",
            headerName: "Actual",
            isCalculated: true,
            type: "sum",
            footer: {
              value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
            }
          },
          {
            field: "variance",
            headerName: "Variance",
            isCalculated: true,
            type: "sum",
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
      {!isNil(groupAccounts) && !isNil(budgetId) && (
        <CreateBudgetAccountGroupModal
          budgetId={budgetId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
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

export default AccountsTable;
