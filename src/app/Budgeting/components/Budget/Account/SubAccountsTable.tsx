import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { faCommentsAlt, faPrint } from "@fortawesome/pro-regular-svg-icons";

import { redux, tabling } from "lib";
import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";

import { setCommentsHistoryDrawerVisibilityAction } from "../../../store/actions/budget";
import { selectCommentsHistoryDrawerOpen, selectSubAccountUnits } from "../../../store/selectors";
import * as actions from "../../../store/actions/budget/account";
import PreviewModal from "../PreviewModal";
import BudgetSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.groups.data
);
const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.search
);
const selectAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.account.fringes.data
);

interface SubAccountsTableProps {
  readonly accountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, accountId }: SubAccountsTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);

  const table = tabling.hooks.useBudgetTable<Tables.SubAccountRow, Model.SubAccount>();

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        budget={budget}
        table={table}
        levelType={"account"}
        data={data}
        groups={groups}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        fringesEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          colId: "fringes"
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesEditor={"FringesEditor"}
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
        cookieNames={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
        onChangeEvent={(e: Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onGroupRows={(rows: Tables.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Tables.SubAccountRow) => row.id))
        }
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
            if (group.color !== groupToEdit.color) {
              table.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal budget={budget} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
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

export default SubAccountsTable;
