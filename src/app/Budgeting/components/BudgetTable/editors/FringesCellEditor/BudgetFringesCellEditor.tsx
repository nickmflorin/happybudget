import { forwardRef } from "react";
import { useSelector } from "react-redux";

import { ICellEditorParams } from "@ag-grid-community/core";

import { selectBudgetFringes } from "../../../../store/selectors";

import FringesCellEditor from "./Generic";

interface BudgetFringesCellEditorProps extends ICellEditorParams {
  onAddFringes: () => void;
}

const BudgetFringesCellEditor = (props: BudgetFringesCellEditorProps, ref: any) => {
  const fringes = useSelector(selectBudgetFringes);
  return <FringesCellEditor fringes={fringes} ref={ref} {...props} />;
};

export default forwardRef(BudgetFringesCellEditor);
