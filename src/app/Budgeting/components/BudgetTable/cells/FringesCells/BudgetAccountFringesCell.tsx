import { useSelector } from "react-redux";

import { simpleDeepEqualSelector } from "store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.fringes.data
);

const BudgetAccountFringesCell = (props: Omit<FringesCellProps, "fringes">): JSX.Element => {
  const fringes = useSelector(selectFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default BudgetAccountFringesCell;
