import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import Cookies from "universal-cookie";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagic, faPrint, faCloud, faCog, faCommentsAlt } from "@fortawesome/pro-solid-svg-icons";
import {
  faFilePlus,
  faCopy,
  faAddressBook,
  faPercentage,
  faFileSpreadsheet,
  faFileInvoice
} from "@fortawesome/pro-light-svg-icons";

import { getBudgetPdf } from "api/services";
import { RenderIfValidId } from "components";
import { componentLoader } from "lib/operational";
import { download } from "lib/util/files";

import { setBudgetIdAction, setCommentsHistoryDrawerVisibilityAction } from "../../store/actions/budget";
import { selectBudgetInstance, selectCommentsHistoryDrawerOpen, selectBudgetDetail } from "../../store/selectors";
import AncestorsBreadCrumbs from "../AncestorsBreadCrumbs";
import Generic from "../Generic";

const Account = React.lazy(() => componentLoader(() => import("./Account")));
const Accounts = React.lazy(() => componentLoader(() => import("./Accounts")));
const SubAccount = React.lazy(() => componentLoader(() => import("./SubAccount")));
const Actuals = React.lazy(() => componentLoader(() => import("./Actuals")));
const Fringes = React.lazy(() => componentLoader(() => import("./Fringes")));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();

  const instance = useSelector(selectBudgetInstance);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);
  const budget = useSelector(selectBudgetDetail);

  useEffect(() => {
    if (!isNaN(parseInt(budgetId))) {
      dispatch(setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <Generic
      breadcrumbs={!isNil(budget) ? <AncestorsBreadCrumbs instance={instance} budget={budget} /> : <></>}
      toolbar={[
        {
          icon: <FontAwesomeIcon icon={faMagic} />,
          disabled: true,
          tooltip: {
            title: "Bid Assistant",
            placement: "bottom",
            overlayClassName: "disabled"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faPrint} />,
          onClick: () => {
            if (!isNaN(parseInt(budgetId))) {
              getBudgetPdf(parseInt(budgetId)).then((response: any) => {
                download(response, !isNil(budget) ? `${budget.name}.pdf` : "budget.pdf");
              });
            }
          },
          tooltip: {
            title: "Export",
            placement: "bottom"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCloud} />,
          disabled: true,
          tooltip: {
            title: "Share",
            placement: "bottom",
            overlayClassName: "disabled"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCog} />,
          disabled: true,
          tooltip: {
            title: "Settings",
            placement: "bottom",
            overlayClassName: "disabled"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCommentsAlt} />,
          onClick: () => dispatch(setCommentsHistoryDrawerVisibilityAction(!commentsHistoryDrawerOpen)),
          role: "drawer-toggle",
          tooltip: {
            title: "Comments",
            placement: "bottom"
          }
        }
      ]}
      sidebar={[
        {
          icon: <FontAwesomeIcon icon={faFilePlus} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "Create New Budget",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCopy} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faAddressBook} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          separatorAfter: true,
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faPercentage} />,
          onClick: () => history.push(`/budgets/${budgetId}/fringes`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/fringes`),
          tooltip: {
            title: "Fringes",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileSpreadsheet} />,
          onClick: () => {
            const cookies = new Cookies();
            // TODO: Only do this if the budgetId refers to the current budgetId the view is
            // rendered for!
            const budgetLastVisited = cookies.get("budget-last-visited");
            if (!isNil(budgetLastVisited)) {
              history.push(budgetLastVisited);
            } else {
              history.push(`/budgets/${budgetId}`);
            }
          },
          active:
            location.pathname.startsWith("/budgets") &&
            !location.pathname.startsWith(`/budgets/${budgetId}/actuals`) &&
            !location.pathname.startsWith(`/budgets/${budgetId}/fringes`),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileInvoice} />,
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
          <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
          <Route path={"/budgets/:budgetId/fringes"} component={Fringes} />
          <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
          <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
          <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
        </Switch>
      </RenderIfValidId>
    </Generic>
  );
};

export default Budget;
