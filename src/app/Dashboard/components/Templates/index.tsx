import React, { useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { CreateBudgetModal } from "components/modals";

import { actions } from "../../store";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

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
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Templates;
