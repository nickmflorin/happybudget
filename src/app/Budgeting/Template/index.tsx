import { useEffect } from "react";

import { isNil } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";

import { budgeting } from "lib";
import { Icon } from "components";
import { BudgetLayout } from "components/layout";
import { Route, PathParamsRoute } from "components/routes";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";
import { actions, selectors } from "../store";

type TemplateProps = {
  readonly budgetId: number;
};

const Template = (props: TemplateProps): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const budget = useSelector((s: Application.Store) =>
    selectors.selectBudgetDetail<Model.Template, false>(s, { domain: "template", public: false }),
  );
  const budgetLoading = useSelector((s: Application.Store) =>
    selectors.selectBudgetLoading(s, { domain: "template", public: false }),
  );
  useEffect(() => {
    dispatch(
      actions.template.requestBudgetAction(null, {
        budgetId: props.budgetId,
        domain: "template",
        public: false,
      }),
    );
  }, [props.budgetId]);

  return (
    <BudgetLayout
      budgetLoading={budgetLoading}
      sidebar={[
        {
          icon: <Icon icon="copy" weight="light" />,
          activeIcon: <Icon icon="copy" weight="solid" />,
          onClick: () => history.push("/templates"),
          tooltip: {
            content: "My Templates",
            placement: "right",
          },
        },
        {
          icon: <Icon icon="file-spreadsheet" weight="light" />,
          activeIcon: <Icon icon="file-spreadsheet" weight="solid" />,
          onClick: () => {
            if (!isNaN(props.budgetId)) {
              const templateLastVisited = budgeting.urls.getLastVisited("template", props.budgetId);
              if (!isNil(templateLastVisited)) {
                history.push(templateLastVisited);
              } else {
                history.push(`/templates/${props.budgetId}`);
              }
            }
          },
          active:
            location.pathname.startsWith("/templates") &&
            !location.pathname.startsWith(`/templates/${props.budgetId}/fringes`),
          tooltip: {
            content: "Template",
            placement: "right",
          },
        },
      ]}
    >
      <Switch>
        <Redirect exact from={match.url} to={`${match.url}/accounts`} />
        <PathParamsRoute<{ accountId: number }>
          params={["accountId"]}
          path={match.url + "/accounts/:accountId"}
          render={(params: { accountId: number }) => (
            <Account id={params.accountId} budgetId={props.budgetId} budget={budget} />
          )}
        />
        <Route
          path={match.url + "/accounts"}
          render={() => <Accounts budgetId={props.budgetId} budget={budget} />}
        />
        <PathParamsRoute<{ subaccountId: number }>
          params={["subaccountId"]}
          path={match.url + "/subaccounts/:subaccountId"}
          render={(params: { subaccountId: number }) => (
            <SubAccount id={params.subaccountId} budgetId={props.budgetId} budget={budget} />
          )}
        />
      </Switch>
    </BudgetLayout>
  );
};

export default Template;
