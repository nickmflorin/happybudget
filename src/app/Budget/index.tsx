import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Switch, useHistory, useLocation, useParams } from "react-router-dom";

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

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";
import { Layout, AncestorsBreadCrumbs } from "components/layout";
import { componentLoader } from "operational";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setBudgetIdAction, setCommentsHistoryDrawerVisibilityAction } from "./actions";
import { selectBudgetDetailLoading } from "./selectors";
import "./index.scss";

const Calculator = React.lazy(() => componentLoader(() => import("./Calculator")));
const Actuals = React.lazy(() => componentLoader(() => import("./Actuals")));

const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.commentsHistoryDrawerOpen
);
const selectAncestors = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.ancestors);

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();

  const ancestors = useSelector(selectAncestors);
  const commentsHistoryDrawerOpen = useSelector(selectCommentsHistoryDrawerOpen);
  const budgetLoading = useSelector(selectBudgetDetailLoading);

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
      breadcrumbs={<AncestorsBreadCrumbs ancestors={ancestors} budgetId={parseInt(budgetId)} />}
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
        <WrapInApplicationSpinner loading={budgetLoading}>
          <div className={"budget"}>
            <Switch>
              <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
              <Route path={"/budgets/:budgetId"} component={Calculator} />
            </Switch>
          </div>
        </WrapInApplicationSpinner>
      </RenderIfValidId>
    </Layout>
  );
};

export default Budget;
