import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faPrint,
  faCloud,
  faCog,
  faCommentsAlt,
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

import { getBudgetPdf } from "api/services";
import { RenderIfValidId } from "components";
import { download } from "lib/util/files";

import {
  wipeStateAction,
  setBudgetIdAction,
  setCommentsHistoryDrawerVisibilityAction
} from "../../store/actions/budget";
import { selectBudgetInstance, selectCommentsHistoryDrawerOpen, selectBudgetDetail } from "../../store/selectors";
import AncestorsBreadCrumbs from "../AncestorsBreadCrumbs";
import { GenericLayout } from "../Generic";
import { getBudgetLastVisited, isBudgetRelatedUrl } from "../../urls";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";
import Actuals from "./Actuals";
import Analysis from "./Analysis";

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
    dispatch(wipeStateAction(null));
    if (!isNaN(parseInt(budgetId))) {
      dispatch(setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <GenericLayout
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
            if (!isNaN(parseInt(budgetId)) && !isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = getBudgetLastVisited(parseInt(budgetId));
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(`/budgets/${budgetId}`);
              }
            }
          },
          active: isBudgetRelatedUrl(location.pathname),
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
          <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
          <Route path={"/budgets/:budgetId/analysis"} component={Analysis} />
          <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
          <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
          <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
        </Switch>
      </RenderIfValidId>
    </GenericLayout>
  );
};

export default Budget;
