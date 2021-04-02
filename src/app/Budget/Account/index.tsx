import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, concat } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setAncestorsAction } from "../actions";
import { setAccountIdAction } from "./actions";
import AccountBudgetTable from "./AccountBudgetTable";
import AccountCommentsHistory from "./AccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.account.detail.data);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.loading
);
const selectDeletingGroups = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.groups.deleting.length !== 0
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectDeletingGroups,
  (tableLoading: boolean, deletingGroups: boolean) => tableLoading || deletingGroups
);

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(
        setAncestorsAction(
          concat(detail.ancestors, [
            {
              id: detail.id,
              identifier: detail.identifier,
              type: "account",
              siblings: detail.siblings
            }
          ])
        )
      );
    }
  }, [detail]);

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
