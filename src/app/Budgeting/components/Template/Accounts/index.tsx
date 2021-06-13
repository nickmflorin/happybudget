import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { WrapInApplicationSpinner } from "components";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, setTemplateAutoIndex } from "../../../store/actions/template";
import { requestAccountsAction, requestGroupsAction } from "../../../store/actions/template/accounts";
import { selectTemplateId } from "../../../store/selectors";
import { setTemplateLastVisited } from "../../../urls";

import AccountsBudgetTable from "./AccountsTable";

const selectAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.groups.loading
);
const selectLoading = createSelector(
  selectAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const templateId = useSelector(selectTemplateId);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
    dispatch(setInstanceAction(null));
    dispatch(requestAccountsAction(null));
    dispatch(requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(templateId)) {
      setTemplateLastVisited(templateId, `/templates/${templateId}/accounts`);
    }
  }, [templateId]);

  return (
    <React.Fragment>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsBudgetTable />
      </WrapInApplicationSpinner>
    </React.Fragment>
  );
};

export default Accounts;
