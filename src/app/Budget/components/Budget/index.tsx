import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { actions } from "../../store";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";
import PreviewModal from "./PreviewModal";

interface BudgetProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Budget = ({ budgetId, budget }: BudgetProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<{
    readonly requestData?: boolean | undefined;
  }>();

  useEffect(() => {
    if (!isNil(location.state?.requestData) && location.state?.requestData === true) {
      dispatch(actions.setBudgetIdAction(budgetId));
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
    }
  }, [location.state, budgetId]);

  return (
    <React.Fragment>
      <Switch>
        <Route
          exact
          path={"/budgets/:budgetId/accounts/:accountId"}
          render={() => <Account budgetId={budgetId} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />}
        />
        <Route
          path={"/budgets/:budgetId/accounts"}
          render={() => (
            <Accounts budgetId={budgetId} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />
          )}
        />
        <Route
          path={"/budgets/:budgetId/subaccounts/:subaccountId"}
          render={() => (
            <SubAccount budgetId={budgetId} budget={budget} setPreviewModalVisible={setPreviewModalVisible} />
          )}
        />
      </Switch>
      <PreviewModal
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        budgetId={budgetId}
        budgetName={!isNil(budget) ? `${budget.name}` : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </React.Fragment>
  );
};

export default Budget;
