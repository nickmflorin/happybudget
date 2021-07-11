import { useSelector } from "react-redux";

import { simpleDeepEqualSelector } from "store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.fringes.data
);

const BudgetSubAccountFringesCell = (props: Omit<FringesCellProps, "fringes">): JSX.Element => {
  const fringes = useSelector(selectFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default BudgetSubAccountFringesCell;
