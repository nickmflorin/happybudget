import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { AccountPage } from "app/Pages";

import { selectors, actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

interface AccountProps {
  readonly id: number;
  readonly tokenId: string;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Account = ({ id, budgetId, budget, tokenId }: AccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const detail = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { domain: "budget", public: true })
  );

  useEffect(() => {
    dispatch(actions.budget.account.requestAccountAction(id));
  }, [id]);

  useEffect(() => {
    if (!isNil(budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(budget, detail, tokenId);
    }
  }, [budget, detail]);

  return (
    <AccountPage budget={budget} detail={detail}>
      <SubAccountsTable id={id} budget={budget} budgetId={budgetId} tokenId={tokenId} />
    </AccountPage>
  );
};

export default Account;
