import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { redux, budgeting } from "lib";
import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";

import { actions } from "../../../store";
import AccountsTable from "./AccountsTable";

const selectAccountsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.budget.table.loading
);
const selectGroupsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.budget.table.groups.loading
);
const selectLoading = createSelector(
  selectAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

interface AccountsProps {
  readonly templateId: number;
  readonly template: Model.Template | undefined;
}

const Accounts = ({ templateId, template }: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(actions.template.setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
    dispatch(actions.template.accounts.requestAccountsAction(null));
    dispatch(actions.template.accounts.requestGroupsAction(null));
  }, []);

  useEffect(() => {
    if (!isNil(templateId)) {
      budgeting.urls.setTemplateLastVisited(templateId, `/templates/${templateId}/accounts`);
    }
  }, [templateId]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ t: template }}
          items={[
            {
              requiredParams: ["t"],
              func: ({ t }: { t: Model.Template }) => ({
                id: t.id,
                primary: true,
                label: t.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(t)
              })
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsTable template={template} templateId={templateId} />
      </WrapInApplicationSpinner>
    </React.Fragment>
  );
};

export default Accounts;
