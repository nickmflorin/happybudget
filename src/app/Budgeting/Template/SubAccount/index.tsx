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
  readonly budget: Model.Template | null;
}

const SubAccount = (props: SubAccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const detail = useSelector((s: Application.Store) => selectors.selectSubAccountDetail(s, { domain: "template" }));

  useEffect(() => {
    dispatch(actions.template.subAccount.requestSubAccountAction(props.id));
  }, [props.id]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(props.budget, detail);
    }
  }, [props.budget, detail]);

  return (
    <SubAccountPage detail={detail} budget={props.budget}>
      <SubAccountsTable {...props} />
    </SubAccountPage>
  );
};

export default SubAccount;
