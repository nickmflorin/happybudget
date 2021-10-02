import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";

import { redux, budgeting } from "lib";

import { SubAccountPage } from "app/Pages";

import { actions } from "../../store";
import SubAccountBudgetTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
);

interface SubAccountProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const SubAccount = ({ template, templateId }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.subAccount.setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(template) && !isNil(detail)) {
      budgeting.urls.setLastVisited(template, detail);
    }
  }, [template]);

  return (
    <SubAccountPage detail={detail} budget={template} subaccountId={subaccountId}>
      <SubAccountBudgetTable template={template} templateId={templateId} subaccountId={parseInt(subaccountId)} />
    </SubAccountPage>
  );
};

export default SubAccount;
