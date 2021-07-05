import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { map } from "lodash";

import * as models from "lib/model";
import { CreateTemplateAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import * as actions from "../../../store/actions/template/accounts";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.groups.data
);
const selectData = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.template.accounts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.search
);

const AccountsTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
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
        detail={templateDetail}
        search={search}
        onSearch={(value: string) => dispatch(actions.setAccountsSearchAction(value))}
        exportFileName={!isNil(templateDetail) ? `template_${templateDetail.name}_accounts` : ""}
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.TemplateAccountRow>) =>
          dispatch(actions.bulkCreateAccountsAction(payload))
        }
        onRowDelete={(ids: number | number[]) => dispatch(actions.deleteAccountsAction(ids))}
        onTableChange={(payload: Table.Change<BudgetTable.TemplateAccountRow>) =>
          dispatch(actions.tableChangedAction(payload))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/accounts/${id}`)}
        onDeleteGroup={(group: Model.TemplateGroup) => dispatch(actions.deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.TemplateAccountRow) =>
          dispatch(actions.removeAccountFromGroupAction(row.id))
        }
        onRowAddToGroup={(group: number, row: BudgetTable.TemplateAccountRow) =>
          dispatch(actions.addAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.TemplateAccountRow[]) =>
          setGroupAccounts(map(rows, (row: BudgetTable.TemplateAccountRow) => row.id))
        }
        onEditGroup={(group: Model.TemplateGroup) => setGroupToEdit(group)}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            type: "sum",
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
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupAccounts(undefined);
            dispatch(actions.addGroupToStateAction(group));
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
            dispatch(actions.updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsTable;
