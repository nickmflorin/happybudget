import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { tabling, budgeting, redux } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "tabling";

import { actions, selectors } from "../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.AccountTableStore
>({
  actions: {
    tableChanged: actions.accounts.handleTableChangeEventAction,
    request: actions.accounts.requestAction,
    loading: actions.accounts.loadingAction,
    response: actions.accounts.responseAction,
    saving: actions.accounts.savingTableAction,
    addModelsToState: actions.accounts.addModelsToStateAction,
    setSearch: actions.accounts.setSearchAction
  },
  selector: selectors.selectAccountsTableStore,
  footerRowSelectors: {
    footer: createSelector(
      redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data),
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0
      })
    )
  }
})(GenericAccountsTable.AuthenticatedTemplate);

interface AccountsTableProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const AccountsTable = ({ templateId, template }: AccountsTableProps): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();

  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: templateId,
    parentType: "template",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: templateId,
    parentType: "template",
    table: table.current,
    onResponse: (response: Http.BudgetContextDetailResponse<Model.Markup, Model.Template>) => {
      dispatch(actions.updateTemplateInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        table={table}
        budget={template}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${templateId}/accounts/${row.id}`)}
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

export default AccountsTable;
