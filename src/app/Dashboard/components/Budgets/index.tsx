import React, { useState, useMemo } from "react";
import { Dispatch } from "redux";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import * as store from "store";
import { EditBudgetModal, CreateBudgetModal } from "components/modals";

import Active from "./Active";
import Archive from "./Archive";
import Collaborating from "./Collaborating";

import { actions } from "../../store";

const Budgets = (): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const [editModal, setEditModal] = useState<JSX.Element | null>(null);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  const history = useHistory();
  const dispatch: Dispatch = useDispatch();

  const editBudget = useMemo(
    () =>
      (b: Model.SimpleBudget, inArchive = false) => {
        const modal = (
          <EditBudgetModal
            open={true}
            id={b.id}
            onCancel={() => setEditModal(null)}
            onSuccess={(budget: Model.Budget) => {
              setEditModal(null);
              if (inArchive === true) {
                dispatch(actions.updateArchiveInStateAction({ id: budget.id, data: budget }));
              } else {
                dispatch(actions.updateBudgetInStateAction({ id: budget.id, data: budget }));
              }
            }}
          />
        );
        setEditModal(modal);
      },
    []
  );

  return (
    <React.Fragment>
      <Switch>
        <Route
          path={"/budgets"}
          render={() => (
            <Active
              onEdit={(b: Model.SimpleBudget) => editBudget(b, false)}
              onCreate={() => setCreateBudgetModalOpen(true)}
            />
          )}
        />
        <Route
          path={"/archive"}
          render={() => (
            <Archive
              onEdit={(b: Model.SimpleBudget) => editBudget(b, true)}
              onCreate={() => setCreateBudgetModalOpen(true)}
            />
          )}
        />
        <Route
          path={"/collaborating"}
          render={() => <Collaborating onCreate={() => setCreateBudgetModalOpen(true)} />}
        />
      </Switch>
      {editModal}
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.UserBudget) => {
            /* This will never be an archived budget, as the only way to get an
               archived budget is to archive an already existing budget. */
            dispatch(actions.addBudgetToStateAction(budget));
            dispatch(store.actions.updateLoggedInUserAction({ ...user, num_budgets: user.num_budgets + 1 }));
            setCreateBudgetModalOpen(false);
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Budgets;
