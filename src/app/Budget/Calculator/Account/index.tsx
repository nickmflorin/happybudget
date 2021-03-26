import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setAccountIdAction } from "./actions";
import AccountBudgetTable from "./AccountBudgetTable";
import AccountCommentsHistory from "./AccountCommentsHistory";

const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.detail
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.loading
);
const selectDetailLoading = createSelector(
  selectAccountDetail,
  (detail: Redux.IDetailResponseStore<IAccount>) => detail.loading
);
const selectDeletingGroups = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.groups.deleting.length !== 0
);
const selectLoading = createSelector(
  selectDetailLoading,
  selectSubAccountsLoading,
  selectDeletingGroups,
  (detailLoading: boolean, tableLoading: boolean, deletingGroups: boolean) =>
    detailLoading || tableLoading || deletingGroups
);

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <AccountBudgetTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
      <AccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default Account;
