import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RenderIfValidId, WrapInApplicationSpinner } from "components/display";

import { setSubAccountIdAction } from "./actions";
import SubAccountBudgetTable from "./SubAccountBudgetTable";
import SubAccountCommentsHistory from "./SubAccountCommentsHistory";

const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ budgetId: string; subaccountId: string }>();
  const dispatch = useDispatch();

  const subAccountStore = useSelector((state: Redux.IApplicationStore) => state.calculator.subaccount);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <WrapInApplicationSpinner loading={subAccountStore.subaccounts.table.loading}>
        <SubAccountBudgetTable />
      </WrapInApplicationSpinner>
      <SubAccountCommentsHistory />
    </RenderIfValidId>
  );
};

export default SubAccount;
