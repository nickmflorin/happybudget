import React, { useState, useMemo } from "react";
import { Dispatch } from "redux";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import * as store from "store";
import { model } from "lib";
import { Config } from "config";

import { Icon } from "components";
import { ExpandedLayout } from "components/layout";
import { CreateBudgetModal } from "components/modals";

import { Contacts, Templates, Budgets } from "./components";
import { actions } from "./store";

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch: Dispatch = useDispatch();

  const user = store.hooks.useLoggedInUser();
  const [createBudgetModalOpen, _setCreateBudgetModalOpen] = useState(false);

  const setCreateBudgetModalOpen = useMemo(
    () => (v: boolean) => {
      if (
        v === true &&
        user.num_budgets !== 0 &&
        !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
      ) {
        dispatch(store.actions.setProductPermissionModalOpenAction(true));
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
            icon: <Icon icon={"file-plus"} weight={"light"} />,
            activeIcon: <Icon icon={"file-plus"} weight={"solid"} />,
            submenu: [
              {
                label: "Discover",
                icon: <Icon icon={"users"} weight={"light"} />,
                activeIcon: <Icon icon={"users"} weight={"solid"} />,
                onClick: () => history.push("/discover"),
                active: location.pathname.startsWith("/discover")
              },
              {
                label: "My Templates",
                icon: <Icon icon={"folder-open"} weight={"light"} />,
                activeIcon: <Icon icon={"folder-open"} weight={"solid"} />,
                onClick: () => history.push("/templates"),
                active: location.pathname.startsWith("/templates")
              }
            ]
          },
          {
            label: "Budgets",
            icon: <Icon icon={"file-plus"} weight={"light"} />,
            activeIcon: <Icon icon={"file-plus"} weight={"solid"} />,
            submenu: [
              {
                label: "Active",
                icon: <Icon icon={"copy"} weight={"light"} />,
                activeIcon: <Icon icon={"copy"} weight={"solid"} />,
                onClick: () => history.push("/budgets"),
                active: location.pathname.startsWith("/budgets")
              },
              {
                label: "Collaborating",
                icon: <Icon icon={"users"} weight={"light"} />,
                activeIcon: <Icon icon={"users"} weight={"solid"} />,
                onClick: () => history.push("/collaborating"),
                active: location.pathname.startsWith("/collaborating"),
                hidden: !Config.collaborationEnabled
              },
              {
                label: "Archive",
                icon: <Icon icon={"books"} weight={"light"} />,
                activeIcon: <Icon icon={"books"} weight={"solid"} />,
                onClick: () => history.push("/archive"),
                active: location.pathname.startsWith("/archive")
              }
            ]
          },
          {
            label: "Contacts",
            icon: <Icon icon={"address-book"} weight={"light"} flip={"horizontal"} />,
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
            /* It is safe to coerce to an Budget because the User must be logged
						   in at this point. */
            dispatch(actions.addBudgetToStateAction(budget));
            dispatch(store.actions.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 }));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Dashboard;
