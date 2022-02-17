import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { tabling, budgeting } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "tabling";

import { actions, selectors, sagas } from "../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.AccountTableStore,
  Tables.AccountTableContext
>({
  actions: {
    tableChanged: actions.accounts.handleTableChangeEventAction,
    loading: actions.accounts.loadingAction,
    response: actions.accounts.responseAction,
    addModelsToState: actions.accounts.addModelsToStateAction,
    setSearch: actions.accounts.setSearchAction
  },
  selector: selectors.selectAccountsTableStore,
  createSaga: (table: Table.TableInstance<R, M>) => sagas.accounts.createTableSaga(table),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.AuthenticatedStore) => state.template.detail.data,
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0
      })
    )
  }
})(GenericAccountsTable.AuthenticatedTemplate);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();

  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    dispatch(actions.accounts.requestAction(null, { budgetId }));
  }, [budgetId]);

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: budgetId,
    parentType: "budget",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: budgetId,
    parentType: "budget",
    table: table.current,
    onResponse: (response: Http.ParentChildResponse<Model.Template, Model.Markup>) => {
      dispatch(actions.updateBudgetInStateAction({ id: response.parent.id, data: response.parent }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"template-accounts"}
        table={table}
        budget={budget}
        actionContext={{ budgetId }}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${budgetId}/accounts/${row.id}`)}
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
