import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil, map } from "lodash";

import { redux, budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.account.detail.data
);

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
                label: t.name,
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
                  render: () => {
                    if (siblings.length !== 0) {
                      return <EntityTextButton fillEmpty={"---------"}>{account}</EntityTextButton>;
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
      <SubAccountsTable accountId={parseInt(accountId)} template={template} templateId={templateId} />
    </RenderIfValidId>
  );
};

export default Account;
