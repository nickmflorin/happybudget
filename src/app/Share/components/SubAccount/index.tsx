import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { redux } from "lib";

import { SubAccountPage } from "app/Pages";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.subaccount.detail.data
);

interface SubAccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccount = ({ budgetId, budget }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.subAccount.setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <SubAccountPage budget={budget} subaccountId={subaccountId} detail={detail}>
      <SubAccountsTable budget={budget} budgetId={budgetId} subaccountId={parseInt(subaccountId)} />
    </SubAccountPage>
  );
};

export default SubAccount;
