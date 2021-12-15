import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { AccountPage } from "app/Pages";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = (state: Application.Authenticated.Store) => state.budget.account.detail.data;

interface AccountProps {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const Account = ({ budgetId, budget }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.account.requestAccountAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(budget, detail);
    }
  }, [budget, detail]);

  return (
    <AccountPage budget={budget} accountId={accountId} detail={detail}>
      <SubAccountsTable accountId={parseInt(accountId)} budget={budget} budgetId={budgetId} />
    </AccountPage>
  );
};

export default Account;
