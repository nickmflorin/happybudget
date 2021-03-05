import { isNil } from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RenderIfValidId, RenderWithSpinner } from "components/display";
import { requestSubAccountSubAccountsAction } from "../actions";
import { initialSubAccountState } from "../initialState";
import { SubAccountsTable } from "./tables";

const SubAccount = (): JSX.Element => {
  const { budgetId, subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();

  const subaccounts = useSelector((state: Redux.IApplicationStore) => {
    let subState = initialSubAccountState;
    if (!isNaN(parseInt(subaccountId))) {
      if (!isNil(state.budget.subaccounts[parseInt(subaccountId)])) {
        subState = state.budget.subaccounts[parseInt(subaccountId)];
      }
    }
    return subState.subaccounts;
  });

  useEffect(() => {
    if (!isNil(subaccountId) && !isNil(parseInt(subaccountId))) {
      dispatch(requestSubAccountSubAccountsAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <RenderIfValidId id={[budgetId, subaccountId]}>
      <RenderWithSpinner loading={subaccounts.loading}>
        <SubAccountsTable budgetId={parseInt(budgetId)} pointer={{ subaccountId: parseInt(subaccountId) }} />
      </RenderWithSpinner>
    </RenderIfValidId>
  );
};

export default SubAccount;
