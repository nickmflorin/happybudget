import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";

import { redux, tabling } from "lib";
import { hooks } from "store";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { TemplateSubAccountsTable } from "components/tabling";

import { actions } from "../../../store";
import FringesModal from "./FringesModal";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.groups.data
);
const selectSubAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.search
);
const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.detail.data
);
const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.fringes.data
);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly templateId: number;
  readonly template: Model.Template | undefined; // Not currently used, but including it is consistent.
}

const SubAccountsTable = ({ subaccountId, template, templateId }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.Group | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectSubAccounts);
  const search = useSelector(selectTableSearch);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const fringes = useSelector(selectFringes);
  const subAccountUnits = hooks.useSubAccountUnits();

  const tableRef = tabling.hooks.useReadWriteBudgetTable<Tables.SubAccountRow, Model.SubAccount>();

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        budget={template}
        tableRef={tableRef}
        levelType={"subaccount"}
        menuPortalId={"supplementary-header"}
        models={data}
        groups={groups}
        subAccountUnits={subAccountUnits}
        fringes={fringes}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
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
        onSearch={(value: string) => dispatch(actions.template.subAccount.setSubAccountsSearchAction(value))}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onChangeEvent={(e: Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>) =>
          dispatch(actions.template.subAccount.handleTableChangeEventAction(e))
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
        cookieNames={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
        onGroupRows={(rows: Tables.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Tables.SubAccountRow) => row.id))
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
            dispatch(actions.template.subAccount.addGroupToStateAction(group));
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
            dispatch(actions.template.subAccount.updateGroupInStateAction({ id: group.id, data: group }));
            if (group.color !== groupToEdit.color) {
              tableRef.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <FringesModal template={template} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
