import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { WrapInApplicationSpinner } from "components/display";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../actions";
import { requestAccountsAction, requestGroupsAction } from "./actions";

import AccountsBudgetTable from "./AccountsBudgetTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";

const selectAccountsTableLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.accounts.loading
);

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAccountsTableLoading);

  useEffect(() => {
    dispatch(setInstanceAction(null));
    dispatch(requestAccountsAction());
    dispatch(requestGroupsAction());
  }, []);

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
