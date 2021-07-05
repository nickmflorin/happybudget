import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import TemplateSubAccountsTable from "../SubAccountsTable";
import { selectTemplateId, selectSubAccountUnits } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/subAccount";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.groups.data
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.search
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.detail.data
);
const selectLoadingSubAcount = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.detail.loading
);

interface SubAccountsTableProps {
  subaccountId: number;
}

const SubAccountsTable = ({ subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountLoading = useSelector(selectLoadingSubAcount);
  const groups = useSelector(selectGroups);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        data={data}
        groups={groups}
        subAccountUnits={subAccountUnits}
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
        onChangeEvent={(e: Table.ChangeEvent<BudgetTable.TemplateSubAccountRow>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onBack={() => {
          if (!isNil(subaccountDetail)) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/templates/${templateId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/templates/${templateId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
        cookies={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
        onDeleteGroup={(group: Model.TemplateGroup) => dispatch(actions.deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.TemplateSubAccountRow) =>
          dispatch(actions.removeSubAccountFromGroupAction(row.id))
        }
        onRowAddToGroup={(group: number, row: BudgetTable.TemplateSubAccountRow) =>
          dispatch(actions.addSubAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.TemplateSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: BudgetTable.TemplateSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.TemplateGroup) => setGroupToEdit(group)}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal<Model.TemplateGroup>
          subaccountId={subaccountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.TemplateGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupToEdit(undefined);
            dispatch(actions.updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
