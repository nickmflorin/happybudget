import React, { useState, useMemo } from "react";
import { Dispatch } from "redux";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import * as config from "config";
import * as store from "store";
import { model } from "lib";

import { Icon } from "components";
import { ExpandedLayout } from "components/layout";
import { CreateBudgetModal } from "components/modals";

import { Contacts, Templates, Budgets } from "./components";
import { actions } from "./store";

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch: Dispatch = useDispatch();

  const [user, _] = store.hooks.useLoggedInUser();
  const [createBudgetModalOpen, _setCreateBudgetModalOpen] = useState(false);

  const setCreateBudgetModalOpen = useMemo(
    () => (v: boolean) => {
      if (
        v === true &&
        user.metrics.num_budgets !== 0 &&
        !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS) &&
        config.env.BILLING_ENABLED
      ) {
        dispatch(store.actions.setProductPermissionModalOpenAction(true, {}));
      } else {
        _setCreateBudgetModalOpen(v);
      }
    },
    [user]
  );

  return (
    <React.Fragment>
      <ExpandedLayout
        sidebar={[
          {
            label: "Templates",
            icon: <Icon icon={"folder-open"} weight={"regular"} />,
            activeIcon: <Icon icon={"folder-open"} weight={"solid"} />,
            submenu: [
              {
                label: "Discover",
                icon: <Icon icon={"camera-movie"} weight={"regular"} />,
                activeIcon: <Icon icon={"camera-movie"} weight={"solid"} />,
                onClick: () => history.push("/discover"),
                active: location.pathname.startsWith("/discover")
              },
              {
                label: "My Templates",
                icon: <Icon icon={"copy"} weight={"regular"} />,
                activeIcon: <Icon icon={"copy"} weight={"solid"} />,
                onClick: () => history.push("/templates"),
                active: location.pathname.startsWith("/templates"),
                tagText: user.metrics.num_templates
              }
            ]
          },
          {
            label: "Budgets",
            icon: <Icon icon={"folder-open"} weight={"regular"} />,
            activeIcon: <Icon icon={"folder-open"} weight={"solid"} />,
            submenu: [
              {
                label: "Active",
                icon: <Icon icon={"copy"} weight={"regular"} />,
                activeIcon: <Icon icon={"copy"} weight={"solid"} />,
                onClick: () => history.push("/budgets"),
                active: location.pathname.startsWith("/budgets"),
                tagText: user.metrics.num_budgets
              },
              {
                label: "Collaborating",
                icon: <Icon icon={"users"} weight={"regular"} />,
                activeIcon: <Icon icon={"users"} weight={"solid"} />,
                onClick: () => history.push("/collaborating"),
                active: location.pathname.startsWith("/collaborating"),
                hidden: !config.env.COLLABORATION_ENABLED,
                tagText: user.metrics.num_collaborating_budgets
              },
              {
                label: "Archive",
                icon: <Icon icon={"books"} weight={"regular"} />,
                activeIcon: <Icon icon={"books"} weight={"solid"} />,
                onClick: () => history.push("/archive"),
                active: location.pathname.startsWith("/archive"),
                tagText: user.metrics.num_archived_budgets
              }
            ]
          },
          {
            label: "Contacts",
            icon: <Icon icon={"address-book"} weight={"regular"} flip={"horizontal"} />,
            activeIcon: <Icon icon={"address-book"} weight={"solid"} flip={"horizontal"} />,
            onClick: () => history.push("/contacts"),
            active: location.pathname.startsWith("/contacts")
          }
        ]}
        showHeaderTextLogo={true}
      >
        <Switch>
          <Route exact path={"/contacts"} component={Contacts} />
          <Route
            exact
            path={["/budgets", "/collaborating", "/archive"]}
            render={() => <Budgets onCreate={() => setCreateBudgetModalOpen(true)} />}
          />
          <Route
            path={["/templates", "/discover"]}
            render={() => <Templates onCreateBudget={() => setCreateBudgetModalOpen(true)} />}
          />
        </Switch>
      </ExpandedLayout>
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.UserBudget) => {
            setCreateBudgetModalOpen(false);
            /*
						It is safe to coerce to an Budget because the User must be logged
						in at this point. */
            dispatch(actions.addBudgetToStateAction(budget, {}));
            dispatch(store.actions.updateLoggedInUserMetricsAction({ metric: "num_budgets", change: "increment" }, {}));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Dashboard;
