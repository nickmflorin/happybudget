import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { map } from "lodash";

import { Page } from "components/layout";

import { ActionDomains, requestBudgetsAction } from "../actions";
import { BudgetTrashCard } from "./Card";
import "./index.scss";

const Trash = (): JSX.Element => {
  const dispatch: Dispatch = useDispatch();
  const budgets = useSelector((state: Redux.IApplicationStore) => state.dashboard.budgets.trash);

  useEffect(() => {
    dispatch(requestBudgetsAction(ActionDomains.TRASH));
  }, []);

  return (
    <Page className={"budgets"} loading={budgets.loading} title={"Deleted Budgets"}>
      <div className={"budgets-grid"}>
        {map(budgets.data, (budget: IBudget) => {
          return (
            <BudgetTrashCard
              budget={budget}
              onRestore={(b: IBudget) => console.log(b)}
              onDelete={(b: IBudget) => console.log(b)}
            />
          );
        })}
      </div>
    </Page>
  );
};

export default Trash;
