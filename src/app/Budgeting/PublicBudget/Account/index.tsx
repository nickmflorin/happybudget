import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { AccountPage } from "app/Budgeting/Pages";

import { selectors, actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

interface AccountProps {
  readonly id: number;
  readonly tokenId: string;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Account = (props: AccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const detail = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { domain: "budget", public: true })
  );

  useEffect(() => {
    dispatch(actions.budget.account.requestAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(props.budget, detail, props.tokenId);
    }
  }, [props.budget, detail]);

  return (
    <AccountPage detail={detail} {...props}>
      <SubAccountsTable {...props} />
    </AccountPage>
  );
};

export default Account;
