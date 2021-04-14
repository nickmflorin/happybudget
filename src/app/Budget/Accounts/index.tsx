import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { createSelector } from "reselect";

import { WrapInApplicationSpinner } from "components";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../store/actions";
import { requestAccountsAction, requestGroupsAction } from "../store/actions/accounts";
import { selectBudgetId } from "../store/selectors";

import AccountsBudgetTable from "./AccountsBudgetTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";
import { isNil } from "lodash";

const selectAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.groups.loading
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

  useEffect(() => {
    dispatch(setInstanceAction(null));
    dispatch(requestAccountsAction(null));
    dispatch(requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(budgetId)) {
      const cookies = new Cookies();
      cookies.set("budget-last-visited", `/budgets/${budgetId}/accounts`);
    }
  }, [budgetId]);

  return (
    <React.Fragment>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsBudgetTable />
      </WrapInApplicationSpinner>
      <AccountsCommentsHistory />
    </React.Fragment>
  );
};

export default Accounts;
