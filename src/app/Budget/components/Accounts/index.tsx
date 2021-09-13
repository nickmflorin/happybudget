import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { budgeting, hooks } from "lib";
import { Portal, BreadCrumbs } from "components/layout";

import { actions } from "../../store";

import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Accounts = ({ budget, budgetId }: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.setBudgetAutoIndex(false));
  }, []);

  useEffect(() => {
    if (!isNil(budgetId)) {
      budgeting.urls.setBudgetLastVisited(budgetId, `/budgets/${budgetId}/accounts`);
    }
  }, [budgetId]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                primary: true,
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            }
          ]}
        />
      </Portal>
      <AccountsTable budget={budget} budgetId={budgetId} />
      {/* <AccountsCommentsHistory /> */}
    </React.Fragment>
  );
};

export default hooks.deepMemo(Accounts);
