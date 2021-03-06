import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch, Route, useRouteMatch, useHistory, useLocation, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faDownload, faShareAlt, faCog, faComments } from "@fortawesome/free-solid-svg-icons";

import { FileAddOutlined, ContactsOutlined, FolderOutlined, DeleteOutlined } from "@ant-design/icons";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { Layout } from "components/layout";
import { AncestorsBreadCrumbs } from "./components";
import "./index.scss";

const Account = React.lazy(() => import("./components/Account"));
const Accounts = React.lazy(() => import("./components/Accounts"));
const SubAccount = React.lazy(() => import("./components/SubAccount"));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const ancestors = useSelector((state: Redux.IApplicationStore) => state.budget.ancestors);
  const ancestorsLoading = useSelector((state: Redux.IApplicationStore) => state.budget.ancestorsLoading);

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
          icon: <FileAddOutlined className={"icon"} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates"),
          tooltip: {
            title: "Create New Budget",
            placement: "right"
          }
        },
        {
          icon: <FolderOutlined className={"icon"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <DeleteOutlined className={"icon"} />,
          onClick: () => history.push("/trash"),
          active: location.pathname.startsWith("/trash"),
          tooltip: {
            title: "Deleted Budgets",
            placement: "right"
          }
        },
        {
          icon: <ContactsOutlined className={"icon"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts"),
          tooltip: {
            title: "Contacts",
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
              <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
            </Switch>
          </div>
        </RenderWithSpinner>
      </RenderIfValidId>
    </Layout>
  );
};

export default Budget;
