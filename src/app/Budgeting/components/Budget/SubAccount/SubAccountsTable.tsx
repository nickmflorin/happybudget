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
import * as actions from "../../../store/actions/budget/subAccount";
import PreviewModal from "../PreviewModal";
import BudgetSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.groups.data
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.children.search
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.detail.data
);
const selectLoadingSubAcount = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.detail.loading
);
const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.data
);

interface SubAccountsTableProps {
  subaccountId: number;
}

const SubAccountsTable = ({ subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetDetail = useSelector(selectBudgetDetail);
  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const loadingSubAccount = useSelector(selectLoadingSubAcount);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);

  const tableRef = useRef<BudgetTable.Ref<BudgetTable.SubAccountRow, Model.SubAccount>>(null);

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        tableRef={tableRef}
        levelType={"subaccount"}
        data={data}
        groups={groups}
        detail={subaccountDetail}
        loadingParent={loadingSubAccount}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        fringesCellEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          colId: "fringes"
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesCellEditor={"FringesCellEditor"}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        onRowExpand={null}
        tableFooterIdentifierValue={
          !isNil(subaccountDetail) && !isNil(subaccountDetail.description)
            ? `${subaccountDetail.description} Total`
            : "Sub Account Total"
        }
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        search={search}
        onSearch={(value: string) => dispatch(actions.setSubAccountsSearchAction(value))}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onChangeEvent={(e: Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onBack={(row?: BudgetTable.FringeRow) => {
          if (
            !isNil(subaccountDetail) &&
            !isNil(subaccountDetail.ancestors) &&
            subaccountDetail.ancestors.length !== 0
          ) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/budgets/${budgetId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/budgets/${budgetId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
        cookies={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
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
          subaccountId={subaccountId}
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
