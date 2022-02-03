import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { Icon } from "components";
import { CollapsedLayout } from "components/layout";
import { Route, PathParamsRoute } from "components/routes";

import { actions, selectors } from "../store";

// Will be moved into this directory after Plaid importing done.
import { Actuals } from "../../Budget/components";

import Account from "./Account";
import Accounts from "./Accounts";
import Analysis from "./Analysis";
import SubAccount from "./SubAccount";
import { BudgetPreviewModal } from "./PreviewModals";

type BudgetProps = {
  readonly budgetId: number;
};

const Budget = (props: BudgetProps): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const budget = useSelector((s: Application.Store) =>
    selectors.selectBudgetDetail(s, { domain: "budget" })
  ) as Model.Budget | null;

  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  useEffect(() => {
    dispatch(actions.budget.requestBudgetAction(props.budgetId));
  }, [props.budgetId]);

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
          onClick: () => history.push(`/budgets/${props.budgetId}/analysis`),
          active: location.pathname.startsWith(`/budgets/${props.budgetId}/analysis`),
          tooltip: {
            title: "Analysis",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-spreadsheet"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-spreadsheet"} />,
          onClick: () => {
            if (!budgeting.urls.isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = budgeting.urls.getLastVisited("budget", props.budgetId);
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(`/budgets/${props.budgetId}`);
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
          onClick: () => history.push(`/budgets/${props.budgetId}/actuals`),
          active: location.pathname.startsWith(`/budgets/${props.budgetId}/actuals`),
          tooltip: {
            title: "Actuals",
            placement: "right"
          }
        }
      ]}
    >
      <Switch>
        <Redirect exact from={match.url} to={`${match.url}/accounts`} />
        <Route path={match.url + "/actuals"} render={() => <Actuals budgetId={props.budgetId} budget={budget} />} />
        <Route path={match.url + "/analysis"} render={() => <Analysis budgetId={props.budgetId} budget={budget} />} />
        <PathParamsRoute<{ accountId: number }>
          params={["accountId"]}
          path={match.url + "/accounts/:accountId"}
          render={(params: { accountId: number }) => (
            <Account
              id={params.accountId}
              budgetId={props.budgetId}
              budget={budget}
              setPreviewModalVisible={setPreviewModalVisible}
            />
          )}
        />
        <Route
          path={match.url + "/accounts"}
          render={() => (
            <Accounts budgetId={props.budgetId} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />
          )}
        />
        <PathParamsRoute<{ subaccountId: number }>
          params={["subaccountId"]}
          path={match.url + "/subaccounts/:subaccountId"}
          render={(params: { subaccountId: number }) => (
            <SubAccount
              id={params.subaccountId}
              budgetId={props.budgetId}
              budget={budget}
              setPreviewModalVisible={setPreviewModalVisible}
            />
          )}
        />
      </Switch>
      <BudgetPreviewModal
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        budgetId={props.budgetId}
        budgetName={!isNil(budget) ? budget.name : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </CollapsedLayout>
  );
};

export default Budget;
