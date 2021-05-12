import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { selectBudgetFringes } from "../../../../store/selectors";
import FringesCellEditor, { FringesCellEditorProps } from "./Generic";

const BudgetFringesCellEditor = (
  props: Omit<FringesCellEditorProps<Table.BudgetSubAccountRow, Model.BudgetGroup>, "fringes">,
  ref: any
) => {
  const fringes = useSelector(selectBudgetFringes);
  return <FringesCellEditor fringes={fringes} ref={ref} {...props} />;
};

export default forwardRef(BudgetFringesCellEditor);
