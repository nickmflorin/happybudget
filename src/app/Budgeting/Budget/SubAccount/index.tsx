import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../../store/actions/budget";
import { setSubAccountIdAction } from "../../store/actions/budget/subAccount";
import { selectBudgetId } from "../../store/selectors";
import SubAccountBudgetTable from "./SubAccountBudgetTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.subaccount.detail.data);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.groups.loading
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
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(subaccountId))) {
      const cookies = new Cookies();
      cookies.set("budget-last-visited", `/budgets/${budgetId}/subaccounts/${subaccountId}`);
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountBudgetTable subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
      <SubAccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default SubAccount;
