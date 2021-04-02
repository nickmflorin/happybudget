import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faRobot,
  faDownload,
  faShareAlt,
  faCog,
  faComments,
  faFolderOpen,
  faFolderPlus,
  faCalculator,
  faDollarSign
} from "@fortawesome/free-solid-svg-icons";

import { RenderIfValidId } from "components/display";
import { Layout, AncestorsBreadCrumbs } from "components/layout";
import { componentLoader } from "operational";

import { setBudgetIdAction, setCommentsHistoryDrawerVisibilityAction } from "./actions";
import { selectInstance, selectCommentsHistoryDrawerOpen, selectBudgetDetail } from "./selectors";

import "./index.scss";
import { isNil } from "lodash";

const Account = React.lazy(() => componentLoader(() => import("./Account")));
const Accounts = React.lazy(() => componentLoader(() => import("./Accounts")));
const SubAccount = React.lazy(() => componentLoader(() => import("./SubAccount")));
const Actuals = React.lazy(() => componentLoader(() => import("./Actuals")));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();

  const instance = useSelector(selectInstance);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);
  const budget = useSelector(selectBudgetDetail);

  useEffect(() => {
    if (!isNaN(parseInt(budgetId))) {
      dispatch(setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <Layout
      collapsed
      includeFooter={false}
      headerProps={{ style: { height: 70 + 36 } }}
      contentProps={{ style: { marginTop: 70 + 36 + 10, height: "calc(100vh - 116px)" } }}
      breadcrumbs={!isNil(budget) ? <AncestorsBreadCrumbs instance={instance} budget={budget} /> : <></>}
      toolbar={[
        {
          icon: <FontAwesomeIcon icon={faRobot} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faDownload} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faShareAlt} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faCog} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faComments} />,
          onClick: () => dispatch(setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen)),
          role: "drawer-toggle"
        }
      ]}
      sidebar={[
        {
          icon: <FontAwesomeIcon icon={faFolderPlus} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "Create New Budget",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFolderOpen} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        // {
        //   icon: <FontAwesomeIcon icon={faTrashAlt} />,
        //   onClick: () => history.push("/trash"),
        //   tooltip: {
        //     title: "Deleted Budgets",
        //     placement: "right"
        //   }
        // },
        {
          icon: <FontAwesomeIcon icon={faAddressBook} />,
          onClick: () => history.push("/contacts"),
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCalculator} />,
          onClick: () => history.push(`/budgets/${budgetId}`),
          active:
            location.pathname.startsWith("/budgets") && !location.pathname.startsWith(`/budgets/${budgetId}/actuals`),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faDollarSign} />,
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
        <div className={"budget"}>
          <Switch>
            <Redirect exact from={match.url} to={`${match.url}/accounts`} />
            <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
            <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
            <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
            <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
          </Switch>
        </div>
      </RenderIfValidId>
    </Layout>
  );
};

export default Budget;
