import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { SubAccountPage } from "app/Pages";

import { actions, selectors } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const SubAccount = ({ id, budgetId, budget, tokenId }: SubAccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const detail = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, { domain: "budget", public: true })
  );

  useEffect(() => {
    dispatch(actions.budget.subAccount.requestSubAccountAction(id));
  }, [id]);

  useEffect(() => {
    if (!isNil(budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(budget, detail, tokenId);
    }
  }, [budget, detail]);

  return (
    <SubAccountPage detail={detail} budget={budget}>
      <SubAccountsTable budget={budget} budgetId={budgetId} id={id} tokenId={tokenId} />
    </SubAccountPage>
  );
};

export default SubAccount;
