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

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.StoreObj) => state.share.account.detail.data
);
const selectSubAccountsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.StoreObj) => state.share.account.table.loading
);
const selectGroupsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.StoreObj) => state.share.account.table.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

interface AccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const Account = ({ budgetId, budget }: AccountProps): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(accountId))) {
      dispatch(actions.account.setAccountIdAction(parseInt(accountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the Account changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(actions.account.requestFringesAction(null));
    }
  }, [accountId]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(accountId))) {
      budgeting.urls.setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts/${accountId}`);
    }
  }, [budgetId, accountId]);

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
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} budget={budget} budgetId={budgetId} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default Account;
