import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, findIndex, orderBy } from "lodash";

import { redux, tabling, budgeting, util } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { connectTableToStore } from "tabling";

import { actions, selectors, sagas } from "../../store";
import TemplateSubAccountsTable, { TemplateSubAccountsTableProps } from "../SubAccountsTable";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

const selectSubAccountDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.template.subaccount.detail.data
);

const ConnectedTable = connectTableToStore<
  TemplateSubAccountsTableProps,
  R,
  M,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext
>({
  actions: {
    tableChanged: actions.subAccount.handleTableChangeEventAction,
    loading: actions.subAccount.loadingAction,
    response: actions.subAccount.responseAction,
    saving: actions.subAccount.savingTableAction,
    addModelsToState: actions.subAccount.addModelsToStateAction,
    setSearch: actions.subAccount.setSearchAction
  },
  createSaga: (table: Table.TableInstance<R, M>) => sagas.subAccount.createTableSaga(table),
  selector: selectors.selectSubAccountsTableStore,
  footerRowSelectors: {
    page: createSelector(
      (state: Application.AuthenticatedStore) => state.template.detail.data,
      (template: Model.Template | null) => ({
        identifier: !isNil(template) && !isNil(template.name) ? `${template.name} Total` : "Budget Total",
        estimated: !isNil(template) ? budgeting.businessLogic.estimatedValue(template) : 0.0
      })
    ),
    footer: createSelector(
      (state: Application.AuthenticatedStore) => state.template.subaccount.detail.data,
      (detail: Model.SubAccount | null) => ({
        identifier: !isNil(detail) && !isNil(detail.description) ? `${detail.description} Total` : "Account Total",
        estimated: !isNil(detail) ? budgeting.businessLogic.estimatedValue(detail) : 0.0
      })
    )
  }
})(TemplateSubAccountsTable);

interface SubAccountsTableProps {
  readonly subaccountId: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const SubAccountsTable = ({ budgetId, budget, subaccountId }: SubAccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const subaccount = useSelector(selectSubAccountDetail);
  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    dispatch(actions.subAccount.requestAction(null, { id: subaccountId, budgetId }));
  }, [subaccountId, budgetId]);

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
      dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"template-subaccount-subaccounts"}
        id={subaccountId}
        budget={budget}
        budgetId={budgetId}
        table={table}
        actionContext={{ id: subaccountId, budgetId }}
        /* Right now, the SubAccount recursion only goes 1 layer deep.
           Account -> SubAccount -> Detail (Recrusive SubAccount). */
        hideEditColumn={true}
        exportFileName={!isNil(subaccount) ? `subaccount_${subaccount.identifier}` : ""}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onBack={() => {
          if (!isNil(subaccount) && !isNil(subaccount.ancestors) && subaccount.ancestors.length !== 0) {
            /* The Budget/Template ancestor should always be first, so we can
               safely assume that the last ancestor is the Account or
							 SubAccount. */
            const ancestor = subaccount.ancestors[subaccount.ancestors.length - 1] as
              | Model.SimpleAccount
              | Model.SimpleSubAccount;
            history.push(
              util.urls.addQueryParamsToUrl(
                budgeting.urls.getUrl(
                  { type: "budget", domain: "template", id: budgetId },
                  { type: ancestor.type, id: ancestor.id }
                ),
                { row: subaccountId }
              )
            );
          }
        }}
        onLeft={() => {
          if (!isNil(subaccount)) {
            const siblings = orderBy([...(subaccount.siblings || []), subaccount], "order");
            const index = findIndex(siblings, (sib: Model.SimpleSubAccount) => sib.id === subaccount.id);
            if (index !== -1 && siblings[index - 1] !== undefined) {
              history.push(
                budgeting.urls.getUrl(
                  { type: "budget", id: budgetId, domain: "template" },
                  { type: "subaccount", id: siblings[index - 1].id }
                )
              );
            }
          }
        }}
        onRight={() => {
          if (!isNil(subaccount)) {
            const siblings = orderBy([...(subaccount.siblings || []), subaccount], "order");
            const index = findIndex(siblings, (sib: Model.SimpleSubAccount) => sib.id === subaccount.id);
            if (index !== -1 && siblings[index + 1] !== undefined) {
              history.push(
                budgeting.urls.getUrl(
                  { type: "budget", id: budgetId, domain: "template" },
                  { type: "subaccount", id: siblings[index + 1].id }
                )
              );
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
