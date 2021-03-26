import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";
import { createSelector } from "reselect";

import { WrapInApplicationSpinner } from "components/display";
import { simpleShallowEqualSelector } from "store/selectors";

import { setAncestorsAction } from "../../actions";
import { requestAccountsAction } from "./actions";
import { selectBudgetDetail, selectBudgetDetailLoading } from "../selectors";

import AccountsBudgetTable from "./AccountsBudgetTable";
import AccountsCommentsHistory from "./AccountsCommentsHistory";

const selectAccountsTableLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.loading
);
const selectLoading = createSelector(
  selectBudgetDetailLoading,
  selectAccountsTableLoading,
  (detailLoading: boolean, tableLoading: boolean) => detailLoading || tableLoading
);

const Accounts = (): JSX.Element => {
  const dispatch = useDispatch();
  const budgetDetail = useSelector(selectBudgetDetail);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(requestAccountsAction());
  }, []);

  useEffect(() => {
    if (!isNil(budgetDetail)) {
      dispatch(
        setAncestorsAction([
          {
            id: budgetDetail.id,
            identifier: budgetDetail.name,
            type: "budget"
          }
        ])
      );
    }
  }, [budgetDetail]);

  return (
    <React.Fragment>
      <WrapInApplicationSpinner loading={loading}>
        <AccountsBudgetTable />
      </WrapInApplicationSpinner>
      <AccountsCommentsHistory />
    </React.Fragment>
  );
};

export default Accounts;
