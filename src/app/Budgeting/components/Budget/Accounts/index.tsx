import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { simpleShallowEqualSelector } from "store/selectors";

import { setBudgetAutoIndex } from "../../../store/actions/budget";
import { requestAccountsAction, requestGroupsAction } from "../../../store/actions/budget/accounts";
import { selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import { setBudgetLastVisited, getUrl } from "../../../urls";

import AccountsTable from "./AccountsTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";

const selectAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.groups.loading
);
const selectLoading = createSelector(
  selectAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectLoading);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(setBudgetAutoIndex(false));
  }, []);

  useEffect(() => {
    dispatch(requestAccountsAction(null));
    dispatch(requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(budgetId)) {
      setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts`);
    }
  }, [budgetId]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ budget: budgetDetail }}
          items={[
            {
              requiredParams: ["budget"],
              func: ({ budget }: { budget: Model.Budget }) => ({
                id: budget.id,
                primary: true,
                text: budget.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: getUrl(budget)
              })
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsTable />
      </WrapInApplicationSpinner>
      <AccountsCommentsHistory />
    </React.Fragment>
  );
};

export default Accounts;
