import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";

import { WrapInApplicationSpinner } from "components/display";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../store/actions";
import { requestAccountsAction, requestGroupsAction } from "../store/actions/accounts";
import { selectBudgetId } from "../store/selectors";

import AccountsBudgetTable from "./AccountsBudgetTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";
import { isNil } from "lodash";

const selectAccountsTableLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.accounts.loading
);

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectAccountsTableLoading);

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
