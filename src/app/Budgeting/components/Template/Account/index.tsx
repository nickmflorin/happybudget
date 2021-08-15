import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { redux, budgeting } from "lib";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { setTemplateAutoIndex } from "../../../store/actions/template";
import * as actions from "../../../store/actions/template/account";

import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.detail.data
);
const selectSubAccountsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.table.loading
);
const selectGroupsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.account.table.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

interface AccountProps {
  readonly templateId: number;
  readonly template: Model.Template | undefined;
}

const Account = ({ templateId, template }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    dispatch(setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.setAccountIdAction(parseInt(accountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the Account changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(actions.requestFringesAction(null));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(accountId))) {
      budgeting.urls.setTemplateLastVisited(templateId, `/templates/${templateId}/accounts/${accountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ t: template, account: detail }}
          items={[
            {
              requiredParams: ["t"],
              func: ({ t }: { t: Model.Template }) => ({
                id: t.id,
                primary: true,
                text: t.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(t)
              })
            },
            {
              requiredParams: ["t", "account"],
              func: ({ t, account }: { t: Model.Template; account: Model.Account }) => {
                const siblings = account.siblings || [];
                return {
                  id: account.id,
                  primary: true,
                  url: budgeting.urls.getUrl(t, account),
                  render: (params: IBreadCrumbItemRenderParams) => {
                    if (siblings.length !== 0) {
                      return (
                        <EntityTextButton onClick={() => params.toggleDropdownVisible()} fillEmpty={"---------"}>
                          {account}
                        </EntityTextButton>
                      );
                    }
                    return <EntityText fillEmpty={"---------"}>{account}</EntityText>;
                  },
                  options: map(siblings, (option: Model.SimpleAccount) => ({
                    id: option.id,
                    url: budgeting.urls.getUrl(t, option),
                    render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                  }))
                };
              }
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} template={template} templateId={templateId} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default Account;
