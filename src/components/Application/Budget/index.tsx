import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, Route, useRouteMatch, useHistory, useLocation, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faTrashAlt,
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

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { Layout } from "components/layout";
import { setBudgetIdAction } from "./actions";
import { AncestorsBreadCrumbs } from "./components";
import "./index.scss";

const Account = React.lazy(() => import("./components/Account"));
const Accounts = React.lazy(() => import("./components/Accounts"));
const SubAccount = React.lazy(() => import("./components/SubAccount"));
const Actuals = React.lazy(() => import("./components/Actuals"));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const ancestors = useSelector((state: Redux.IApplicationStore) => state.budget.ancestors);
  const ancestorsLoading = useSelector((state: Redux.IApplicationStore) => state.budget.ancestorsLoading);

  useEffect(() => {
    if (!isNaN(parseInt(budgetId))) {
      dispatch(setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <Layout
      collapsed
      breadcrumbs={
        <AncestorsBreadCrumbs loading={ancestorsLoading} ancestors={ancestors} budgetId={parseInt(budgetId)} />
      }
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
          disabled: true
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
        {
          icon: <FontAwesomeIcon icon={faTrashAlt} />,
          onClick: () => history.push("/trash"),
          tooltip: {
            title: "Deleted Budgets",
            placement: "right"
          }
        },
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
        <RenderWithSpinner loading={budget.loading}>
          <div className={"budget"}>
            <Switch>
              <Redirect exact from={match.url} to={`${match.url}/accounts`} />
              <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
              <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
              <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
              <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
            </Switch>
          </div>
        </RenderWithSpinner>
      </RenderIfValidId>
    </Layout>
  );
};

export default Budget;
