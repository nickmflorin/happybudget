import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setSubAccountIdAction } from "./actions";
import SubAccountBudgetTable from "./SubAccountBudgetTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.detail
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.loading
);
const selectDetailLoading = createSelector(
  selectSubAccountDetail,
  (detail: Redux.IDetailResponseStore<ISubAccount>) => detail.loading
);
const selectDeletingGroups = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.groups.deleting.length !== 0
);
const selectLoading = createSelector(
  selectDetailLoading,
  selectSubAccountsLoading,
  selectDeletingGroups,
  (detailLoading: boolean, tableLoading: boolean, deletingGroups: boolean) =>
    detailLoading || tableLoading || deletingGroups
);

const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

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
