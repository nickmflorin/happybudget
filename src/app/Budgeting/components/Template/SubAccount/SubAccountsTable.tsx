import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectTemplateId, selectSubAccountUnits } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/subAccount";
import TemplateSubAccountsTable from "../SubAccountsTable";
import FringesModal from "./FringesModal";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.groups.data
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.children.search
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.detail.data
);
const selectLoadingSubAcount = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.detail.loading
);
const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.fringes.data
);

interface SubAccountsTableProps {
  subaccountId: number;
}

const SubAccountsTable = ({ subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountLoading = useSelector(selectLoadingSubAcount);
  const groups = useSelector(selectGroups);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        levelType={"subaccount"}
        data={data}
        groups={groups}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        fringesCellEditorParams={{
          onAddFringes: () => setFringesModalVisible(true),
          colId: "fringes"
        }}
        onEditFringes={() => setFringesModalVisible(true)}
        fringesCellEditor={"TemplateSubAccountFringesCellEditor"}
        loadingParent={subAccountLoading}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        onRowExpand={null}
        detail={subaccountDetail}
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
        onBack={() => {
          if (
            !isNil(subaccountDetail) &&
            !isNil(subaccountDetail.ancestors) &&
            subaccountDetail.ancestors.length !== 0
          ) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/templates/${templateId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/templates/${templateId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
        cookies={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
        onGroupRows={(rows: BudgetTable.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.SubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.Group) => setGroupToEdit(group)}
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
          }}
        />
      )}
      <FringesModal open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
