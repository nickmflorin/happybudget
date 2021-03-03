import React from "react";
import { Redirect, Switch, Route, useRouteMatch, useHistory, useLocation } from "react-router-dom";

import { FileAddOutlined, ContactsOutlined, FolderOutlined, DeleteOutlined } from "@ant-design/icons";

import { Layout } from "components/layout";
import { ShareIcon, ChatIcon, ExportIcon, SettingsIcon, BidAssistantIcon } from "components/svgs";

const Account = React.lazy(() => import("./components/Account"));
const Accounts = React.lazy(() => import("./components/Accounts"));
const SubAccount = React.lazy(() => import("./components/SubAccount"));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  return (
    <Layout
      collapsed
      toolbar={[
        {
          icon: <BidAssistantIcon />
        },
        {
          icon: <ExportIcon />
        },
        {
          icon: <ShareIcon />
        },
        {
          icon: <SettingsIcon />
        },
        {
          icon: <ChatIcon />
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
      <Switch>
        <Redirect exact from={match.url} to={`${match.url}/accounts`} />
        <Route exact path={`${match.url}/accounts`} component={Accounts} />
        <Route exact path={`${match.url}/accounts/:accountId`} component={Account} />
        <Route exact path={`${match.url}/subaccounts/:subaccountId`} component={SubAccount} />
      </Switch>
    </Layout>
  );
};

export default Budget;
