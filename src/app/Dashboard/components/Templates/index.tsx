import React, { useState, useMemo } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as store from "store";
import { users } from "lib";
import { CreateBudgetModal } from "components/modals";

import { actions } from "../../store";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";

const Templates = (): JSX.Element => {
  const [templateToDerive, _setTemplateToDerive] = useState<number | undefined>(undefined);
  const [createBudgetModalOpen, _setCreateBudgetModalOpen] = useState(false);
  const user = users.hooks.useLoggedInUser();

  const dispatch = useDispatch();
  const history = useHistory();

  const setTemplateToDerive = useMemo(
    () => (id: number | undefined) => {
      if (
        id !== undefined &&
        user.num_budgets !== 0 &&
        !users.permissions.userHasPermission(user, users.permissions.Permissions.MULTIPLE_BUDGETS)
      ) {
        dispatch(store.actions.authenticated.setProductPermissionModalOpenAction(true));
      } else {
        _setTemplateToDerive(id);
      }
    },
    [user]
  );

  const setCreateBudgetModalOpen = useMemo(
    () => (v: boolean) => {
      if (
        v === true &&
        user.num_budgets !== 0 &&
        !users.permissions.userHasPermission(user, users.permissions.Permissions.MULTIPLE_BUDGETS)
      ) {
        dispatch(store.actions.authenticated.setProductPermissionModalOpenAction(true));
      } else {
        _setCreateBudgetModalOpen(v);
      }
    },
    [user]
  );

  return (
    <React.Fragment>
      <Switch>
        <Route
          path={"/templates"}
          render={() => (
            <MyTemplates
              setTemplateToDerive={setTemplateToDerive}
              setCreateBudgetModalOpen={setCreateBudgetModalOpen}
            />
          )}
        />
        <Route
          path={"/discover"}
          render={() => (
            <Discover setTemplateToDerive={setTemplateToDerive} setCreateBudgetModalOpen={setCreateBudgetModalOpen} />
          )}
        />
      </Switch>
      {!isNil(templateToDerive) && (
        <CreateBudgetModal
          open={true}
          templateId={templateToDerive}
          onCancel={() => setTemplateToDerive(undefined)}
          title={"Create Budget from Template"}
          onSuccess={(budget: Model.Budget) => {
            setTemplateToDerive(undefined);
            dispatch(actions.addBudgetToStateAction(budget));
            dispatch(
              store.actions.authenticated.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 })
            );
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            setCreateBudgetModalOpen(false);
            dispatch(actions.addBudgetToStateAction(budget));
            dispatch(
              store.actions.authenticated.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 })
            );
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Templates;
