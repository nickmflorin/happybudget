import React, { useState, useMemo } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as store from "store";
import { model } from "lib";
import { CreateBudgetModal } from "components/modals";

import { actions } from "../../store";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";

const Templates = (): JSX.Element => {
  const [templateToDerive, _setTemplateToDerive] = useState<number | undefined>(undefined);
  const [createBudgetModalOpen, _setCreateBudgetModalOpen] = useState(false);
  const user = store.hooks.useLoggedInUser();

  const dispatch = useDispatch();
  const history = useHistory();

  const setTemplateToDerive = useMemo(
    () => (id: number | undefined) => {
      if (
        id !== undefined &&
        user.num_budgets !== 0 &&
        !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
      ) {
        dispatch(store.actions.setProductPermissionModalOpenAction(true));
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
            /* It is safe to coerce to an Budget because the User must be
						   logged in at this point. */
            dispatch(actions.addBudgetToStateAction(budget as Model.AuthenticatedBudget));
            dispatch(store.actions.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 }));
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
            /* It is safe to coerce to an Budget because the User must be logged
						   in at this point. */
            dispatch(actions.addBudgetToStateAction(budget as Model.AuthenticatedBudget));
            dispatch(store.actions.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 }));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Templates;
