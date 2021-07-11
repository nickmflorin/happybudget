import { useSelector } from "react-redux";

import { simpleDeepEqualSelector } from "store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.fringes.data
);

const TemplateSubAccountFringesCell = (
  props: Omit<FringesCellProps<BudgetTable.SubAccountRow>, "fringes">
): JSX.Element => {
  const fringes = useSelector(selectFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default TemplateSubAccountFringesCell;
