import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { redux, budgeting } from "lib";
import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";

import { actions } from "../../../store";

import AccountsTable from "./AccountsTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";

const selectAccountsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.budget.table.loading
);
const selectGroupsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.budget.table.groups.loading
);
const selectLoading = createSelector(
  selectAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const Accounts = ({ budget, budgetId }: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(actions.budget.setBudgetAutoIndex(false));
  }, []);

  useEffect(() => {
    dispatch(actions.budget.accounts.requestAccountsAction(null));
    dispatch(actions.budget.accounts.requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(budgetId)) {
      budgeting.urls.setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts`);
    }
  }, [budgetId]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                primary: true,
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsTable budget={budget} budgetId={budgetId} />
      </WrapInApplicationSpinner>
      <AccountsCommentsHistory />
    </React.Fragment>
  );
};

export default Accounts;
