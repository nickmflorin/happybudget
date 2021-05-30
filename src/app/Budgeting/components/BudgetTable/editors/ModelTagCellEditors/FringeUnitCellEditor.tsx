import { forwardRef } from "react";
import { FringeUnits } from "lib/model";
import ModelTagCellEditor, { ModelTagCellEditorProps } from "./Generic";

const FringeUnitCellEditor = (props: ModelTagCellEditorProps, ref: any) => {
  return (
    <ModelTagCellEditor<Model.FringeUnit> searchIndices={["name"]} models={FringeUnits} forwardedRef={ref} {...props} />
  );
};

export default forwardRef(FringeUnitCellEditor);
