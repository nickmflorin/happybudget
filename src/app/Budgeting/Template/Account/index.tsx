import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../../store/actions/template";
import { setAccountIdAction } from "../../store/actions/template/account";
import { selectTemplateId } from "../../store/selectors";
import AccountBudgetTable from "./AccountBudgetTable";

const selectDetail = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.account.detail.data);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.account.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.account.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const templateId = useSelector(selectTemplateId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(accountId))) {
      const cookies = new Cookies();
      cookies.set("template-last-visited", `/templates/${templateId}/accounts/${accountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <AccountBudgetTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default Account;
