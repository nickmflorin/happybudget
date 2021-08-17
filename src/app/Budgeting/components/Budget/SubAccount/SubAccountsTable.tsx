import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { redux, tabling } from "lib";
import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { hooks } from "store";

import { actions, selectors } from "../../../store";
import PreviewModal from "../PreviewModal";
import BudgetSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.table.groups.data
);
const selectSubAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.table.search
);
const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.table.fringes.data
);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const SubAccountsTable = ({ budget, budgetId, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const subAccountUnits = hooks.useSubAccountUnits();
  const fringes = useSelector(selectFringes);
  const commentsHistoryDrawerOpen = useSelector(selectors.selectCommentsHistoryDrawerOpen);

  const tableRef = tabling.hooks.useReadWriteBudgetTable<Tables.SubAccountRow, Model.SubAccount>();

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        budget={budget}
        levelType={"subaccount"}
        tableRef={tableRef}
        models={data}
        groups={groups}
        detail={subaccountDetail}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
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
        onSearch={(value: string) => dispatch(actions.budget.subAccount.setSubAccountsSearchAction(value))}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onChangeEvent={(e: Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.budget.subAccount.handleTableChangeEventAction(e))
        }
        onBack={(row?: Tables.FringeRow) => {
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
        cookieNames={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
        onGroupRows={(rows: Tables.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Tables.SubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
        actions={[
          {
            icon: "print",
            label: "Export PDF",
            onClick: () => setPreviewModalVisible(true)
          },
          {
            label: "Comments",
            icon: "comments-alt",
            onClick: () => dispatch(actions.budget.setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen))
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
            dispatch(actions.budget.subAccount.addGroupToStateAction(group));
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
            dispatch(actions.budget.subAccount.updateGroupInStateAction({ id: group.id, data: group }));
            if (group.color !== groupToEdit.color) {
              tableRef.current.applyGroupColorChange(group);
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
