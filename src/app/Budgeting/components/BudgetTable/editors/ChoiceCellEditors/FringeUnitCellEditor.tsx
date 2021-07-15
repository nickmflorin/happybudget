import { forwardRef } from "react";
import { FringeUnits } from "lib/model";
import ChoiceCellEditor, { ChoiceCellEditorProps } from "./Generic";

const FringeUnitCellEditor = (
  props: Omit<ChoiceCellEditorProps<Model.FringeUnit>, "models" | "searchIndices">,
  ref: any
) => {
  return (
    <ChoiceCellEditor<Model.FringeUnit> searchIndices={["name"]} models={FringeUnits} forwardedRef={ref} {...props} />
  );
};

export default forwardRef(FringeUnitCellEditor);
