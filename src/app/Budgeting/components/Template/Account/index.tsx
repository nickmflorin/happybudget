import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, setTemplateAutoIndex } from "../../../store/actions/template";
import { setAccountIdAction } from "../../../store/actions/template/account";
import { requestFringesAction } from "../../../store/actions/template/fringes";
import { selectTemplateId } from "../../../store/selectors";
import { setTemplateLastVisited } from "../../../urls";

import SubAccountsTable from "./SubAccountsTable";

const selectDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.groups.loading
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
    dispatch(setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(setAccountIdAction(parseInt(accountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the Account changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(requestFringesAction(null));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(accountId))) {
      setTemplateLastVisited(templateId, `/templates/${templateId}/accounts/${accountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default Account;
