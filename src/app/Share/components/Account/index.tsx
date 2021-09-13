import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { map } from "lodash";

import { redux, budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.account.detail.data
);

interface AccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Account = ({ budgetId, budget }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.account.setAccountIdAction(parseInt(accountId)));
    }
  }, [accountId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget, account: detail }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                primary: true,
                text: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            },
            {
              requiredParams: ["b", "account"],
              func: ({ b, account }: { b: Model.Budget; account: Model.Account }) => {
                const siblings = account.siblings || [];
                return {
                  id: account.id,
                  primary: true,
                  url: budgeting.urls.getUrl(b, account),
                  render: () => {
                    if (siblings.length !== 0) {
                      return <EntityTextButton fillEmpty={"---------"}>{account}</EntityTextButton>;
                    }
                    return <EntityText fillEmpty={"---------"}>{account}</EntityText>;
                  },
                  options: map(siblings, (option: Model.SimpleAccount) => ({
                    id: option.id,
                    url: budgeting.urls.getUrl(b, option),
                    render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                  }))
                };
              }
            }
          ]}
        />
      </Portal>
      <SubAccountsTable accountId={parseInt(accountId)} budget={budget} budgetId={budgetId} />
    </RenderIfValidId>
  );
};

export default Account;
