import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import { CreateTemplateAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/accounts";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.groups.data
);
const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.children.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.children.search
);

const AccountsTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const templateDetail = useSelector(selectTemplateDetail);
  const groups = useSelector(selectGroups);

  return (
    <React.Fragment>
      <GenericAccountsTable
        data={data}
        groups={groups}
        detail={templateDetail}
        search={search}
        onSearch={(value: string) => dispatch(actions.setAccountsSearchAction(value))}
        exportFileName={!isNil(templateDetail) ? `template_${templateDetail.name}_accounts` : ""}
        onChangeEvent={(e: Table.ChangeEvent<BudgetTable.AccountRow, Model.Account>) =>
          dispatch(actions.handleTableChangeEventAction(e))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/accounts/${id}`)}
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
              value: !isNil(templateDetail) && !isNil(templateDetail.estimated) ? templateDetail.estimated : 0.0
            }
          }
        ]}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateTemplateAccountGroupModal
          templateId={templateId}
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
