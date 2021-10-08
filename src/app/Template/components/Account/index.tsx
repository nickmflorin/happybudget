import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { AccountPage } from "app/Pages";
import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = (state: Application.Authenticated.Store) => state.template.account.detail.data;

interface AccountProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const Account = ({ templateId, template }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.account.setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(template) && !isNil(detail)) {
      budgeting.urls.setLastVisited(template, detail);
    }
  }, [template]);

  return (
    <AccountPage budget={template} detail={detail} accountId={accountId}>
      <SubAccountsTable accountId={parseInt(accountId)} template={template} templateId={templateId} />
    </AccountPage>
  );
};

export default Account;
