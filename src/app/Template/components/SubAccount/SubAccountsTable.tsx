import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { redux, tabling, budgeting } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { connectTableToStore } from "components/tabling";

import { actions, selectors } from "../../store";
import TemplateSubAccountsTable, { TemplateSubAccountsTableProps } from "../SubAccountsTable";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
);

const ConnectedTable = connectTableToStore<TemplateSubAccountsTableProps, R, M, Tables.SubAccountTableStore>({
  actions: {
    tableChanged: actions.subAccount.handleTableChangeEventAction,
    loading: actions.subAccount.loadingAction,
    response: actions.subAccount.responseAction,
    saving: actions.subAccount.savingTableAction,
    addModelsToState: actions.subAccount.addModelsToStateAction,
    setSearch: actions.subAccount.setSearchAction,
    clear: actions.subAccount.clearAction
  },
  // We cannot autoRequest because we have to also request the new data when the dropdown breadcrumbs change.
  autoRequest: false,
  selector: selectors.selectSubAccountsTableStore,
  footerRowSelectors: {
    page: createSelector(
      redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data),
      (template: Model.Template | null) => ({
        identifier: !isNil(template) && !isNil(template.name) ? `${template.name} Total` : "Budget Total",
        estimated: !isNil(template) ? budgeting.businessLogic.estimatedValue(template) : 0.0
      })
    ),
    footer: createSelector(
      redux.selectors.simpleDeepEqualSelector(
        (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
      ),
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0
      })
    )
  }
})(TemplateSubAccountsTable);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const SubAccountsTable = ({ templateId, template, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: subaccountId,
    parentType: "subaccount",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
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
        template={template}
        templateId={templateId}
        table={table}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        rowCanExpand={false}
        exportFileName={!isNil(subaccountDetail) ? `subaccount_${subaccountDetail.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onBack={(row?: Tables.FringeRowData) => {
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
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.managers.markupId(row.id))}
      />
      {groupModals}
      {markupModals}
    </React.Fragment>
  );
};

export default SubAccountsTable;
