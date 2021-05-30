import { forwardRef } from "react";
import { useSelector } from "react-redux";

import { selectSubAccountUnits } from "../../../../store/selectors";
import ModelTagCellEditor, { ModelTagCellEditorProps } from "./Generic";

const SubAccountUnitCellEditor = (props: ModelTagCellEditorProps, ref: any) => {
  const units = useSelector(selectSubAccountUnits);
  return <ModelTagCellEditor<Model.Tag> searchIndices={["title"]} models={units} forwardedRef={ref} {...props} />;
};

export default forwardRef(SubAccountUnitCellEditor);
