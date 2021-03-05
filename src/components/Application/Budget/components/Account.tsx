import { isNil } from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { requestAccountSubAccountsAction } from "../actions";
import { initialAccountState } from "../initialState";
import { SubAccountsTable } from "./tables";

const Account = (): JSX.Element => {
  const { budgetId, accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();

  const subaccounts = useSelector((state: Redux.IApplicationStore) => {
    let subState = initialAccountState;
    if (!isNaN(parseInt(accountId))) {
      if (!isNil(state.budget.accounts.details[parseInt(accountId)])) {
        subState = state.budget.accounts.details[parseInt(accountId)];
      }
    }
    return subState.subaccounts;
  });

  useEffect(() => {
    if (!isNil(budgetId) && !isNaN(parseInt(budgetId)) && !isNil(accountId) && !isNil(parseInt(accountId))) {
      dispatch(requestAccountSubAccountsAction(parseInt(accountId), parseInt(budgetId)));
    }
  }, [budgetId, accountId]);

  return (
    <RenderIfValidId id={[budgetId, accountId]}>
      <RenderWithSpinner loading={subaccounts.loading}>
        <SubAccountsTable budgetId={parseInt(budgetId)} pointer={{ accountId: parseInt(accountId) }} />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default Account;
