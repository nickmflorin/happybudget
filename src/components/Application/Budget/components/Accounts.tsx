import { isNil } from "lodash";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { RenderIfValidId } from "components/display";
import { requestBudgetAccountsAction } from "../actions";
import AccountsTable from "./AccountsTable";

const Accounts = (): JSX.Element => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId))) {
      dispatch(requestBudgetAccountsAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={budgetId}>
      <AccountsTable budgetId={parseInt(budgetId)} />
    </RenderIfValidId>
  );
};

export default Accounts;
