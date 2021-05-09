import { useSelector } from "react-redux";

import { selectBudgetFringes } from "../../../../store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const BudgetFringesCell = (props: Omit<FringesCellProps<Table.BudgetSubAccountRow>, "fringes">): JSX.Element => {
  const fringes = useSelector(selectBudgetFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default BudgetFringesCell;
