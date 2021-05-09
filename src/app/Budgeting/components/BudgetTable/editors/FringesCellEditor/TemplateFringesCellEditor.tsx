import { forwardRef } from "react";
import { useSelector } from "react-redux";

import { ICellEditorParams } from "@ag-grid-community/core";

import { selectTemplateFringes } from "../../../../store/selectors";

import FringesCellEditor from "./Generic";

interface BudgetFringesCellEditorProps extends ICellEditorParams {
  onAddFringes: () => void;
}

const TemplateFringesCellEditor = (props: BudgetFringesCellEditorProps, ref: any) => {
  const fringes = useSelector(selectTemplateFringes);
  return <FringesCellEditor fringes={fringes} ref={ref} {...props} />;
};

export default forwardRef(TemplateFringesCellEditor);
