import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { createSelector } from "reselect";
import { map } from "lodash";

import * as models from "lib/model";
import { CreateTemplateAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import {
  setAccountsSearchAction,
  deselectAccountAction,
  selectAccountAction,
  removeAccountAction,
  selectAllAccountsAction,
  addGroupToStateAction,
  deleteGroupAction,
  removeAccountFromGroupAction,
  tableChangedAction,
  updateGroupInStateAction,
  bulkCreateAccountsAction,
  addAccountToGroupAction
} from "../../../store/actions/template/accounts";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.selected
);
const selectData = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.template.accounts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.search
);
const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const AccountsTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const templateDetail = useSelector(selectTemplateDetail);
  const groups = useSelector(selectGroups);

  return (
    <React.Fragment>
      <GenericAccountsTable<
        BudgetTable.TemplateAccountRow,
        Model.TemplateAccount,
        Model.TemplateGroup,
        Http.TemplateAccountPayload
      >
        data={data}
        groups={groups}
        manager={models.TemplateAccountRowManager}
        selected={selected}
        detail={templateDetail}
        search={search}
        onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.TemplateAccountRow>) =>
          dispatch(bulkCreateAccountsAction(payload))
        }
        onRowSelect={(id: number) => dispatch(selectAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectAccountAction(id))}
        onRowDelete={(row: BudgetTable.TemplateAccountRow) => dispatch(removeAccountAction(row.id))}
        onTableChange={(payload: Table.Change<BudgetTable.TemplateAccountRow>) => dispatch(tableChangedAction(payload))}
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/accounts/${id}`)}
        onDeleteGroup={(group: Model.TemplateGroup) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.TemplateAccountRow) => dispatch(removeAccountFromGroupAction(row.id))}
        onRowAddToGroup={(group: number, row: BudgetTable.TemplateAccountRow) =>
          dispatch(addAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.TemplateAccountRow[]) =>
          setGroupAccounts(map(rows, (row: BudgetTable.TemplateAccountRow) => row.id))
        }
        onEditGroup={(group: Model.TemplateGroup) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllAccountsAction(null))}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            tableTotal: !isNil(templateDetail) && !isNil(templateDetail.estimated) ? templateDetail.estimated : 0.0,
            type: "sum"
          }
        ]}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateTemplateAccountGroupModal
          templateId={templateId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.TemplateGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupToEdit(undefined);
            dispatch(updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsTable;
