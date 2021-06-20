import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { simpleShallowEqualSelector } from "store/selectors";

import { setTemplateAutoIndex } from "../../../store/actions/template";
import { requestAccountsAction, requestGroupsAction } from "../../../store/actions/template/accounts";
import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import { setTemplateLastVisited, getUrl } from "../../../urls";

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
  const templateDetail = useSelector(selectTemplateDetail);

  useEffect(() => {
    dispatch(setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
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
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ template: templateDetail }}
          items={[
            {
              requiredParams: ["template"],
              func: ({ template }: { template: Model.Template }) => ({
                id: template.id,
                primary: true,
                text: template.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: getUrl(template)
              })
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsBudgetTable />
      </WrapInApplicationSpinner>
    </React.Fragment>
  );
};

export default Accounts;
