import { isNil } from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { requestAccountsAction } from "../actions";
import { AccountsTable } from "./tables";

const Accounts = (): JSX.Element => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const dispatch = useDispatch();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.budget.accounts.list);

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId))) {
      dispatch(requestAccountsAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <RenderIfValidId id={budgetId}>
      <RenderWithSpinner loading={accounts.loading}>
        <AccountsTable budgetId={parseInt(budgetId)} />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Accounts;
