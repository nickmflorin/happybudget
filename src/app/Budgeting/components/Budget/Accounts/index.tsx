import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { WrapInApplicationSpinner } from "components";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../../../store/actions/budget";
import { requestAccountsAction, requestGroupsAction } from "../../../store/actions/budget/accounts";
import { selectBudgetId } from "../../../store/selectors";

import AccountsTable from "./AccountsTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";

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
    console.log("SEtting Instance Null");
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
        <AccountsTable />
      </WrapInApplicationSpinner>
      <AccountsCommentsHistory />
    </React.Fragment>
  );
};

export default Accounts;
