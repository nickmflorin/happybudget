import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, setBudgetAutoIndex } from "../../../store/actions/budget";
import { setAccountIdAction } from "../../../store/actions/budget/account";
import { requestFringesAction } from "../../../store/actions/budget/fringes";
import { selectBudgetId } from "../../../store/selectors";
import { setBudgetLastVisited } from "../../../urls";

import SubAccountsTable from "./SubAccountsTable";
import AccountCommentsHistory from "./AccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    dispatch(setBudgetAutoIndex(false));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the Account changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(requestFringesAction(null));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    } else {
      dispatch(setInstanceAction(null));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(accountId))) {
      setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts/${accountId}`);
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
      <AccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default Account;
