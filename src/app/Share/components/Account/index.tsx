import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { redux } from "lib";

import { AccountPage } from "app/Pages";
import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.detail.data
);

interface AccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Account = ({ budgetId, budget }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.account.setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  return (
    <AccountPage detail={detail} accountId={accountId} budget={budget}>
      <SubAccountsTable accountId={parseInt(accountId)} budget={budget} budgetId={budgetId} />
    </AccountPage>
  );
};

export default Account;
