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
import { setSubAccountIdAction } from "../../../store/actions/budget/subAccount";
import { requestFringesAction } from "../../..//store/actions/budget/fringes";
import { selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import { setBudgetLastVisited, getUrl } from "../../../urls";
import SubAccountsTable from "./SubAccountsTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const selectDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);
const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const budgetId = useSelector(selectBudgetId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(setBudgetAutoIndex(true));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the SubAccount changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(requestFringesAction(null));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(subaccountId))) {
      setBudgetLastVisited(budgetId, `/budgets/${budgetId}/subaccounts/${subaccountId}`);
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ budget: budgetDetail, subaccount: detail }}
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
              requiredParams: ["budget", "subaccount"],
              func: ({ budget, subaccount }: { budget: Model.Budget; subaccount: Model.BudgetSubAccount }) => {
                return [
                  ...map(subaccount.ancestors.slice(1), (ancestor: Model.Entity) => {
                    return {
                      id: ancestor.id,
                      render: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                      url: getUrl(budget, ancestor)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: getUrl(budget, subaccount),
                    render: (params: IBreadCrumbItemRenderParams) => {
                      if (subaccount.siblings.length !== 0) {
                        return (
                          <EntityTextButton onClick={() => params.toggleDropdownVisible()} fillEmpty={"---------"}>
                            {subaccount}
                          </EntityTextButton>
                        );
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(subaccount.siblings, (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: getUrl(budget, option),
                      render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                    }))
                  }
                ];
              }
            }
          ]}
        />
      </Portal>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountsTable subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
      <SubAccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default SubAccount;
