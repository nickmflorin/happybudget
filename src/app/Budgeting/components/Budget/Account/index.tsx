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

import { setBudgetAutoIndex } from "../../../store/actions/budget";
import { setAccountIdAction } from "../../../store/actions/budget/account";
import { requestFringesAction } from "../../../store/actions/budget/fringes";
import { selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import { getUrl, setBudgetLastVisited } from "../../../urls";

import SubAccountsTable from "./SubAccountsTable";
import AccountCommentsHistory from "./AccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

const Account = (): JSX.Element => {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(setBudgetAutoIndex(false));
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
    if (!isNil(budgetId) && !isNaN(parseInt(accountId))) {
      setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts/${accountId}`);
    }
  }, [budgetId, accountId]);

  return (
    <RenderIfValidId id={[accountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ budget: budgetDetail, account: detail }}
          items={[
            {
              requiredParams: ["budget"],
              func: ({ budget }: { budget: Model.Budget }) => ({
                id: budget.id,
                primary: true,
                text: budget.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: getUrl(budget)
              })
            },
            {
              requiredParams: ["budget", "account"],
              func: ({ budget, account }: { budget: Model.Budget; account: Model.BudgetAccount }) => ({
                id: account.id,
                primary: true,
                url: getUrl(budget, account),
                render: (params: IBreadCrumbItemRenderParams) => {
                  if (account.siblings.length !== 0) {
                    return (
                      <EntityTextButton onClick={() => params.setDropdownVisible(true)} fillEmpty={"---------"}>
                        {account}
                      </EntityTextButton>
                    );
                  }
                  return <EntityText fillEmpty={"---------"}>{account}</EntityText>;
                },
                options: map(account.siblings, (option: Model.SimpleAccount) => ({
                  id: option.id,
                  url: getUrl(budget, option),
                  render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                }))
              })
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable accountId={parseInt(accountId)} />
      </WrapInApplicationSpinner>
      <AccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default Account;
