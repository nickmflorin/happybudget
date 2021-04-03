import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../actions";
import { setSubAccountIdAction } from "./actions";
import SubAccountBudgetTable from "./SubAccountBudgetTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.subaccount.detail.data);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.loading
);
const selectDeletingGroups = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.groups.deleting.length !== 0
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectDeletingGroups,
  (tableLoading: boolean, deletingGroups: boolean) => tableLoading || deletingGroups
);

const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();
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
