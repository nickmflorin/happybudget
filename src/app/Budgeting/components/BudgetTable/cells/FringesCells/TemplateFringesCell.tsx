import { useSelector } from "react-redux";

import { selectTemplateFringes } from "../../../../store/selectors";
import FringesCell, { FringesCellProps } from "./Generic";

const TemplateFringesCell = (
  props: Omit<FringesCellProps<BudgetTable.TemplateSubAccountRow>, "fringes">
): JSX.Element => {
  const fringes = useSelector(selectTemplateFringes);
  return <FringesCell fringes={fringes} {...props} />;
};

export default TemplateFringesCell;
