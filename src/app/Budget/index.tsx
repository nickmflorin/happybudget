import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { Icon, RenderIfValidId } from "components";
import { CollapsedLayout } from "components/layout";

import { Account, SubAccount, PreviewModal, Accounts, Actuals, Analysis } from "./components";
import { actions, selectors } from "./store";

const RootBudget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();
  const budget = useSelector(selectors.selectBudgetDetail);

  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  useEffect(() => {
    if (!isNaN(parseInt(budgetId))) {
      dispatch(actions.setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <CollapsedLayout
      className={"layout--budget"}
      sidebar={[
        {
          icon: <Icon weight={"light"} icon={"file-plus"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-plus"} />,
          onClick: () => history.push("/discover"),
          tooltip: {
            title: "Templates",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"copy"} />,
          activeIcon: <Icon weight={"solid"} icon={"copy"} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"address-book"} flip={"horizontal"} />,
          activeIcon: <Icon weight={"solid"} icon={"address-book"} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          separatorAfter: true,
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-chart-line"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-chart-line"} />,
          onClick: () => history.push(`/budgets/${budgetId}/analysis`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/analysis`),
          tooltip: {
            title: "Analysis",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-spreadsheet"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-spreadsheet"} />,
          onClick: () => {
            /* When coming from Actuals, we need to get the latest Budget in
							 the case that Actual(s) were changed.  We only request the Budget
							 when the Budget ID changes, which it will not have here, so we
							 need to trigger the effect to manually request the data. */
            /* let state = {};
               if (location.pathname.startsWith(`/budgets/${budgetId}/actuals`)) {
                 state = { requestData: true };
               } */
            if (!isNaN(parseInt(budgetId)) && !budgeting.urls.isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = budgeting.urls.getLastVisited("budgets", budgetId);
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(`/budgets/${budgetId}`);
              }
            }
          },
          active: budgeting.urls.isBudgetRelatedUrl(location.pathname),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-invoice"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-invoice"} />,
          onClick: () => history.push(`/budgets/${budgetId}/actuals`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/actuals`),
          tooltip: {
            title: "Actuals",
            placement: "right"
          }
        }
      ]}
    >
      <RenderIfValidId id={[budgetId]}>
        <Switch>
          <Redirect exact from={match.url} to={`${match.url}/accounts`} />
          <Route
            path={"/budgets/:budgetId/actuals"}
            render={() => <Actuals budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            path={"/budgets/:budgetId/analysis"}
            render={() => <Analysis budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            exact
            path={"/budgets/:budgetId/accounts/:accountId"}
            render={() => (
              <Account budgetId={parseInt(budgetId)} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />
            )}
          />
          <Route
            path={"/budgets/:budgetId/accounts"}
            render={() => (
              <Accounts budgetId={parseInt(budgetId)} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />
            )}
          />
          <Route
            path={"/budgets/:budgetId/subaccounts/:subaccountId"}
            render={() => (
              <SubAccount
                budgetId={parseInt(budgetId)}
                budget={budget}
                setPreviewModalVisible={setPreviewModalVisible}
              />
            )}
          />
        </Switch>
        <PreviewModal
          visible={previewModalVisible}
          onCancel={() => setPreviewModalVisible(false)}
          budgetId={parseInt(budgetId)}
          budgetName={!isNil(budget) ? `${budget.name}` : `Sample Budget ${new Date().getFullYear()}`}
          filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
        />
      </RenderIfValidId>
    </CollapsedLayout>
  );
};

export default RootBudget;
