import { forwardRef } from "react";
import { useSelector } from "react-redux";

import { selectSubAccountUnits } from "../../../../store/selectors";
import ChoiceCellEditor, { ChoiceCellEditorProps } from "./Generic";

const SubAccountUnitCellEditor = (
  props: Omit<ChoiceCellEditorProps<Model.Tag>, "models" | "searchIndices">,
  ref: any
) => {
  const units = useSelector(selectSubAccountUnits);
  return <ChoiceCellEditor<Model.Tag> searchIndices={["title"]} models={units} forwardedRef={ref} {...props} />;
};

export default forwardRef(SubAccountUnitCellEditor);
