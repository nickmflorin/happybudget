import React, { useState, useMemo } from "react";

import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { Dispatch } from "redux";

import { EditBudgetModal } from "components/modals";

import Active from "./Active";
import Archive from "./Archive";
import Collaborating from "./Collaborating";
import { actions } from "../../store";

type BudgetsProps = {
  readonly onCreate: () => void;
};

const Budgets = (props: BudgetsProps): JSX.Element => {
  const [editModal, setEditModal] = useState<JSX.Element | null>(null);
  const dispatch: Dispatch = useDispatch();

  const editBudget = useMemo(
    () =>
      (b: Model.SimpleBudget, inArchive = false) => {
        const modal = (
          <EditBudgetModal
            open={true}
            modelId={b.id}
            onCancel={() => setEditModal(null)}
            onSuccess={(budget: Model.Budget) => {
              setEditModal(null);
              if (inArchive === true) {
                dispatch(actions.updateArchiveInStateAction({ id: budget.id, data: budget }, {}));
              } else {
                dispatch(actions.updateBudgetInStateAction({ id: budget.id, data: budget }, {}));
              }
            }}
          />
        );
        setEditModal(modal);
      },
    [],
  );

  return (
    <React.Fragment>
      <Switch>
        <Route
          path="/budgets"
          render={() => (
            <Active {...props} onEdit={(b: Model.SimpleBudget) => editBudget(b, false)} />
          )}
        />
        <Route
          path="/archive"
          render={() => (
            <Archive {...props} onEdit={(b: Model.SimpleBudget) => editBudget(b, true)} />
          )}
        />
        <Route path="/collaborating" render={() => <Collaborating {...props} />} />
      </Switch>
      {editModal}
    </React.Fragment>
  );
};

export default Budgets;
