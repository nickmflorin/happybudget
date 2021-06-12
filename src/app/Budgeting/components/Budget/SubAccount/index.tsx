import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, setBudgetAutoIndex } from "../../../store/actions/budget";
import { setSubAccountIdAction } from "../../../store/actions/budget/subAccount";
import { requestFringesAction } from "../../..//store/actions/budget/fringes";
import { selectBudgetId } from "../../../store/selectors";
import { setBudgetLastVisited } from "../../../urls";
import SubAccountsTable from "./SubAccountsTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);
const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    dispatch(setBudgetAutoIndex(true));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the SubAccount changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(requestFringesAction(null));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    } else {
      dispatch(setInstanceAction(null));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(subaccountId))) {
      setBudgetLastVisited(budgetId, `/budgets/${budgetId}/subaccounts/${subaccountId}`);
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
      <SubAccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default SubAccount;
