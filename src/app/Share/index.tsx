import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePlus as faFilePlusSolid,
  faCopy as faCopySolid,
  faAddressBook as faAddressBookSolid,
  faFileSpreadsheet as faFileSpreadsheetSolid,
  faFileInvoice as faFileInvoiceSolid,
  faFileChartLine as faFileChartLineSolid
} from "@fortawesome/pro-solid-svg-icons";
import {
  faFilePlus,
  faCopy,
  faAddressBook,
  faFileSpreadsheet,
  faFileInvoice,
  faFileChartLine
} from "@fortawesome/pro-light-svg-icons";

import { budgeting } from "lib";
import { RenderIfValidId } from "components";
import { Layout } from "components/layout";

import { actions, selectors } from "./store";

import { Account, Accounts, SubAccount } from "./components";

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();
  const budget = useSelector(selectors.selectBudgetDetail);

  useEffect(() => {
    dispatch(actions.wipeStateAction(null));
    if (!isNaN(parseInt(budgetId))) {
      dispatch(actions.setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <Layout
      collapsed
      className={"layout--budget"}
      sidebar={[
        {
          icon: <FontAwesomeIcon icon={faFilePlus} />,
          activeIcon: <FontAwesomeIcon icon={faFilePlusSolid} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "Templates",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCopy} />,
          activeIcon: <FontAwesomeIcon icon={faCopySolid} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faAddressBook} flip={"horizontal"} />,
          activeIcon: <FontAwesomeIcon icon={faAddressBookSolid} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          separatorAfter: true,
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileChartLine} />,
          activeIcon: <FontAwesomeIcon icon={faFileChartLineSolid} />,
          onClick: () => history.push(`/budgets/${budgetId}/analysis`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/analysis`),
          tooltip: {
            title: "Analysis",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileSpreadsheet} />,
          activeIcon: <FontAwesomeIcon icon={faFileSpreadsheetSolid} />,
          onClick: () => {
            if (!isNaN(parseInt(budgetId)) && !budgeting.urls.isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = budgeting.urls.getBudgetLastVisited(parseInt(budgetId));
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
          icon: <FontAwesomeIcon icon={faFileInvoice} />,
          activeIcon: <FontAwesomeIcon icon={faFileInvoiceSolid} />,
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
            exact
            path={"/budgets/:budgetId/accounts/:accountId"}
            render={() => <Account budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            path={"/budgets/:budgetId/accounts"}
            render={() => <Accounts budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            path={"/budgets/:budgetId/subaccounts/:subaccountId"}
            render={() => <SubAccount budgetId={parseInt(budgetId)} budget={budget} />}
          />
        </Switch>
      </RenderIfValidId>
    </Layout>
  );
};

export default Budget;
