import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setTemplateAutoIndex } from "../../../store/actions/template";
import * as actions from "../../../store/actions/template/account";
import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import { setTemplateLastVisited, getUrl } from "../../../urls";

import SubAccountsTable from "./SubAccountsTable";

const selectDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.groups.loading
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
  const templateDetail = useSelector(selectTemplateDetail);

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
      setTemplateLastVisited(templateId, `/templates/${templateId}/accounts/${accountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ template: templateDetail, account: detail }}
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
            },
            {
              requiredParams: ["template", "account"],
              func: ({ template, account }: { template: Model.Template; account: Model.Account }) => {
                const siblings = account.siblings || [];
                return {
                  id: account.id,
                  primary: true,
                  url: getUrl(template, account),
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
                    url: getUrl(template, option),
                    render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                  }))
                };
              }
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default Account;
