import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { WrapInApplicationSpinner } from "components";
import { simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction } from "../../../store/actions/template";
import { requestAccountsAction, requestGroupsAction } from "../../../store/actions/template/accounts";
import { selectTemplateId } from "../../../store/selectors";

import AccountsBudgetTable from "./AccountsBudgetTable";

const selectAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.template.accounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.template.accounts.groups.loading
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
    dispatch(setInstanceAction(null));
    dispatch(requestAccountsAction(null));
    dispatch(requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(templateId)) {
      const cookies = new Cookies();
      cookies.set("template-last-visited", `/templates/${templateId}/accounts`);
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
