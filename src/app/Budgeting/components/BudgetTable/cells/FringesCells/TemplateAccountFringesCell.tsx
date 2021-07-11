import { useSelector } from "react-redux";

import { simpleDeepEqualSelector } from "store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const selectFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.account.fringes.data
);

const TemplateAccountFringesCell = (
  props: Omit<FringesCellProps<BudgetTable.SubAccountRow>, "fringes">
): JSX.Element => {
  const fringes = useSelector(selectFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default TemplateAccountFringesCell;
