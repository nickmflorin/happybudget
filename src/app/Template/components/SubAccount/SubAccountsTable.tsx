import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { redux, tabling, model } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { SubAccountsTable as GenericSubAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
);

const selectFringes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.table.fringes.data
);

const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.table.subaccountUnits
);

const ActionMap = {
  tableChanged: actions.subAccount.handleTableChangeEventAction,
  loading: actions.subAccount.loadingAction,
  response: actions.subAccount.responseAction,
  saving: actions.subAccount.savingTableAction,
  addModelsToState: actions.subAccount.addModelsToStateAction,
  setSearch: actions.subAccount.setSearchAction,
  clear: actions.subAccount.clearAction
};

const ConnectedTable = connectTableToStore<
  GenericSubAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.SubAccountTableStore
>({
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  actions: ActionMap,
  selector: redux.selectors.simpleDeepEqualSelector(
    (state: Application.Authenticated.Store) => state.template.subaccount.table
  ),
  footerRowSelectors: {
    page: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data)],
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? model.businessLogic.estimatedValue(budget) : 0.0
      })
    ),
    footer: createSelector(
      [
        redux.selectors.simpleDeepEqualSelector(
          (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
        )
      ],
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? model.businessLogic.estimatedValue(detail) : 0.0
      })
    )
  }
})(GenericSubAccountsTable.AuthenticatedTemplate);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly templateId: number;
  readonly template: Model.Template | null; // Not currently used, but including it is consistent.
}

const SubAccountsTable = ({ subaccountId, template, templateId }: SubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const subaccountDetail = useSelector(selectSubAccountDetail);
  const subAccountUnits = useSelector(selectSubAccountUnits);
  const fringes = useSelector(selectFringes);

  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      dispatch(
        actions.subAccount.handleTableChangeEventAction({
          type: "groupUpdated",
          payload: { id: group.id, data: group }
        })
      )
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onResponse: (response: Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount, Model.Template>) => {
      dispatch(actions.subAccount.updateInStateAction({ id: response.parent.id, data: response.parent }));
      dispatch(actions.updateTemplateInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"subaccount-subaccounts-table"}
        table={table}
        fringes={
          filter(fringes, (f: Table.BodyRow<Tables.FringeRowData>) =>
            tabling.typeguards.isModelRow(f)
          ) as Tables.FringeRow[]
        }
        subAccountUnits={subAccountUnits}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        rowCanExpand={false}
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
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
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows?: Table.ModelRow<R>[]) =>
          rows === undefined ? onCreateMarkup() : onCreateMarkup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.rows.markupId(row.id))}
      />
      {groupModals}
      {markupModals}
      <FringesModal template={template} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
