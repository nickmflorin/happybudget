import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { selectTemplateFringes } from "../../../../store/selectors";
import FringesCellEditor, { FringesCellEditorProps } from "./Generic";

const TemplateFringesCellEditor = (
  props: Omit<FringesCellEditorProps<BudgetTable.TemplateSubAccountRow, Model.TemplateGroup>, "fringes">,
  ref: any
) => {
  const fringes = useSelector(selectTemplateFringes);
  return <FringesCellEditor fringes={fringes} ref={ref} {...props} />;
};

export default forwardRef(TemplateFringesCellEditor);
